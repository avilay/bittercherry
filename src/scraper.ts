import axios from "axios";
import * as cheerio from "cheerio";
import { writeFile, readFile, mkdir, access } from "fs/promises";
import path from "path";
import { config } from "./config.js";

const EPAPER_BASE = "https://epaper.bombaysamachar.com/view";
const LAST_ID_FILE = "last_id.txt";

// Seed value — only used if last_id.txt doesn't exist yet
const SEED_ID = 2451;

async function readLastId(): Promise<number> {
  try {
    const content = await readFile(LAST_ID_FILE, "utf-8");
    return parseInt(content.trim(), 10);
  } catch {
    return SEED_ID;
  }
}

async function saveLastId(id: number): Promise<void> {
  await writeFile(LAST_ID_FILE, String(id));
}

/**
 * Find the PDF download URL by fetching the HTML edition page and
 * extracting the link from the "btn-pdfdownload" anchor.
 * Tries IDs starting from the last successful one, incrementing by 2.
 */
async function findPdfUrl(date: Date): Promise<string> {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const lastId = await readLastId();

  // Try up to 20 IDs forward from last known, stepping by 2
  for (let id = lastId; id <= lastId + 40; id += 2) {
    const url = `${EPAPER_BASE}/${id}/${dateStr}`;
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(response.data);
      const pdfHref = $("a.btn-pdfdownload").attr("href");
      if (pdfHref) {
        console.log(`Found edition page: ${url}`);
        await saveLastId(id);
        return pdfHref;
      }
    } catch {
      // 404 or other error — try next ID
    }
  }

  throw new Error(`No PDF found for ${dateStr}`);
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
