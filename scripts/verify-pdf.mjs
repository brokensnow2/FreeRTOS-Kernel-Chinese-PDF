import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { readJson, repoRoot } from "./book-utils.mjs";

const config = readJson("zh-CN/book.json");
const outputPath = path.join(repoRoot, config.output);

if (!fs.existsSync(outputPath)) {
  throw new Error(`PDF does not exist: ${config.output}`);
}

const bytes = fs.readFileSync(outputPath);
if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
  throw new Error("Output does not have a valid PDF header.");
}

const document = await PDFDocument.load(bytes);
const pageCount = document.getPageCount();

if (pageCount < 4) {
  throw new Error(`Expected at least 4 pages, received ${pageCount}.`);
}

if (bytes.length < 50_000) {
  throw new Error(`PDF is unexpectedly small: ${bytes.length} bytes.`);
}

console.log(`Verified ${config.output}: ${pageCount} pages, ${Math.round(bytes.length / 1024)} KiB.`);
