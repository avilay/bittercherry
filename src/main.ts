import { scrapeLatestPdf } from "./scraper.js";
import { connectWhatsApp, sendPdf } from "./whatsapp.js";
import { notifyError } from "./notifier.js";
import { config } from "./config.js";

async function main() {
  if (!config.contactName) {
    console.error("Set CONTACT_NAME env var (e.g., 'John Doe')");
    process.exit(1);
  }

  const pdfPath = await scrapeLatestPdf();
  const { context, page } = await connectWhatsApp();

  try {
    await sendPdf(page, pdfPath, config.contactName);
  } finally {
    await context.close();
  }
}

main().catch(async (err) => {
  console.error(err);
  await notifyError(err);
  process.exit(1);
});
