import { chromium, type BrowserContext, type Page } from "playwright";
import path from "path";
import { config } from "./config.js";

const WHATSAPP_URL = "https://web.whatsapp.com";
const SESSION_DIR = config.authDir;

/**
 * Launch a browser with WhatsApp Web.
 * Uses saved session if available, otherwise shows the QR code for scanning.
 * Always runs non-headless. For cronjobs, wrap with xvfb-run.
 */
export async function connectWhatsApp(): Promise<{
  context: BrowserContext;
  page: Page;
}> {
  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    channel: "chromium",
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(WHATSAPP_URL);

  // Wait for either the QR code or the chat list to appear
  const locator = page.locator(
    'canvas[aria-label="Scan this QR code to link a device!"], div[aria-label="Chat list"]',
  );
  try {
    await locator.first().waitFor({ timeout: 30000 });
  } catch (err) {
    // Capture what the page actually looks like for debugging
    await page.screenshot({ path: "debug-headless.png", fullPage: true });
    console.error(
      "Could not find QR code or chat list. Saved debug-headless.png",
    );
    throw err;
  }

  // If QR code is showing, wait for the user to scan it
  const qr = page.locator(
    'canvas[aria-label="Scan this QR code to link a device!"]',
  );
  if (await qr.isVisible()) {
    console.log("QR code is displayed in the browser — scan it with your phone.");
    console.log("Waiting for authentication...");
    await page
      .locator('div[aria-label="Chat list"]')
      .waitFor({ timeout: 120000 });
  }

  console.log("WhatsApp connected");
  return { context, page };
}

/**
 * Send a PDF file to a WhatsApp contact by name.
 */
export async function sendPdf(
  page: Page,
  filePath: string,
  contactName: string,
): Promise<void> {
  const absolutePath = path.resolve(filePath);

  // Open search — Ctrl+/ is the WhatsApp Web shortcut for search
  await page.keyboard.press("Control+/");
  await page.waitForTimeout(1000);

  // Type the contact name into whatever field is focused
  await page.keyboard.type(contactName, { delay: 50 });
  await page.waitForTimeout(2000);

  // Click the contact in search results
  await page.locator(`span[title="${contactName}"]`).first().click();
  await page.waitForTimeout(1000);

  // Click the attachment button (+ icon)
  await page.locator('[aria-label="Attach"]').first().click();
  await page.waitForTimeout(500);

  // Click "Document" in the attachment menu — this opens a native file picker,
  // so we listen for Playwright's filechooser event to set the file.
  // Use exact text match to avoid matching SVG icon titles like "document-refreshed-thin".
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByText("Document", { exact: true }).first().click(),
  ]);
  await fileChooser.setFiles(absolutePath);
  await page.waitForTimeout(2000);

  // Click send — the green send button in the file preview
  const sendButton = page.locator('div[role="button"][aria-label="Send"]');
  await sendButton.click();

  // Wait for the message to actually go through
  await page.waitForTimeout(5000);

  console.log(`Sent ${path.basename(filePath)} to ${contactName}`);
}
