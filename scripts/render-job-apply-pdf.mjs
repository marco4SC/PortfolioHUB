import fs from "node:fs/promises";
import puppeteer from "puppeteer";

const [, , htmlPath, pdfPath] = process.argv;
if (!htmlPath || !pdfPath) throw new Error("Usage: node scripts/render-job-apply-pdf.mjs <resume.html> <resume.pdf>");
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setContent(await fs.readFile(htmlPath, "utf8"), { waitUntil: "networkidle0" });
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
} finally {
  await browser.close();
}
