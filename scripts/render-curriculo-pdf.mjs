// Gera o PDF oficial do curriculo a partir de curriculo.html.
// Roda na integracao continua antes do deploy, para que o PDF publicado
// esteja sempre sincronizado com o HTML, sem versionar binario no main.
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const [, , htmlPath = "curriculo.html", pdfPath = "Marco-Antonio-de-Souza-Carvalho-Curriculo.pdf"] = process.argv;

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
try {
  const page = await browser.newPage();
  // Carrega via file:// (em vez de setContent) para que o CSS @page e os
  // caminhos relativos da pagina sejam resolvidos como no navegador.
  await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true
  });
  console.log(`PDF gerado: ${pdfPath}`);
} finally {
  await browser.close();
}
