import axios from "axios";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { config } from "./config.js";

const BASE_URL = "https://epaper.bombaysamachar.com/media";

/**
 * Build candidate URLs for a given date, trying different page counts
 * and "page" vs "pages" variants.
 */
function buildCandidateUrls(date: Date): string[] {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const yyyy = String(date.getFullYear());

  const folder = `${yyyy}-${mm}`;
  const dateStr = `${dd}${mm}${yy}`;

  const urls: string[] = [];

  // Try page counts from 8 to 20
  for (let pages = 8; pages <= 20; pages++) {
    for (const suffix of ["page", "pages"]) {
      urls.push(
        `${BASE_URL}/${folder}/ms_${dateStr}_msmu_01--${pages}-${suffix}-mor-insert.pdf`,
      );
    }
  }

  return urls;
}

/**
 * Find the actual PDF URL for the given date by probing candidates with HEAD requests.
 */
async function findPdfUrl(date: Date): Promise<string> {
  const candidates = buildCandidateUrls(date);

  for (const url of candidates) {
    try {
      await axios.head(url);
      return url;
    } catch {
      // 404 or other error — try next candidate
    }
  }

  throw new Error(`No PDF found for ${date.toISOString().slice(0, 10)}`);
}

/**
 * Download a PDF from the given URL and save it locally.
 * Skips download if the file already exists.
 */
async function downloadPdf(url: string): Promise<string> {
  await mkdir(config.downloadDir, { recursive: true });

  const filename = path.basename(new URL(url).pathname);
  const filepath = path.join(config.downloadDir, filename);

  try {
    await access(filepath);
    console.log(`Using cached: ${filepath}`);
    return filepath;
  } catch {
    // File doesn't exist, proceed to download
  }

  const response = await axios.get(url, { responseType: "arraybuffer" });
  await writeFile(filepath, response.data);

  console.log(`Downloaded: ${filepath}`);
  return filepath;
}

/**
 * Get the current date in IST (UTC+5:30), since the paper publishes from India.
 */
function todayInIST(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + istOffset);
}

/**
 * Find and download today's PDF from Bombay Samachar.
 */
export async function scrapeLatestPdf(): Promise<string> {
  const today = todayInIST();
  console.log(`Looking for PDF for ${today.toISOString().slice(0, 10)}...`);

  const pdfUrl = await findPdfUrl(today);
  console.log(`Found: ${pdfUrl}`);

  return downloadPdf(pdfUrl);
}
