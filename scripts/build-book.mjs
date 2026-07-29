import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { repoRoot, validateBook } from "./book-utils.mjs";
import { createMarkdownParser } from "./markdown.mjs";

const { config } = validateBook();
const outputArgument = readArgument("--output");
const htmlArgument = readArgument("--html");
const outputPath = path.resolve(repoRoot, outputArgument ?? config.output);
const css = fs.readFileSync(path.join(repoRoot, "styles/book.css"), "utf8");
const markdownParser = createMarkdownParser();

const parts = [];
for (const relativePath of config.files) {
  const absolutePath = path.join(repoRoot, relativePath);
  const markdown = fs.readFileSync(absolutePath, "utf8");
  let html = markdownParser.parse(markdown);

  html = html.replace(
    /href=["'](?:\.\/)?ch\d+\.md#([^"']+)["']/g,
    'href="#$1"'
  );
  html = await inlineLocalImages(html, absolutePath);

  const name = path.basename(relativePath, ".md");
  parts.push(
    `<section class="book-part part-${escapeAttribute(name)}" data-source="${escapeAttribute(relativePath)}">${html}</section>`
  );
}

const documentHtml = `<!doctype html>
<html lang="${escapeAttribute(config.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(config.title)} - ${escapeHtml(config.edition)}</title>
  <style>${css}</style>
</head>
<body>
  <main class="book">${parts.join("\n")}</main>
</body>
</html>`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
if (htmlArgument) {
  const htmlPath = path.resolve(repoRoot, htmlArgument);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, documentHtml, "utf8");
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      pageErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.setContent(documentHtml, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = [...document.images];
    await Promise.all(
      images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", reject, { once: true });
        });
      })
    );

    const brokenImages = images.filter((image) => image.naturalWidth === 0);
    if (brokenImages.length > 0) {
      throw new Error(`Broken images: ${brokenImages.map((image) => image.alt || image.src).join(", ")}`);
    }
  });

  if (pageErrors.length > 0) {
    throw new Error(`Browser rendering errors:\n- ${pageErrors.join("\n- ")}`);
  }

  await page.pdf({
    path: outputPath,
    format: "A4",
    outline: true,
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true
  });
} finally {
  await browser.close();
}

const outputSize = fs.statSync(outputPath).size;
if (outputSize < 50_000) {
  throw new Error(`Generated PDF is unexpectedly small: ${outputSize} bytes.`);
}

console.log(`Built ${path.relative(repoRoot, outputPath)} (${Math.round(outputSize / 1024)} KiB).`);

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function inlineLocalImages(html, sourcePath) {
  const imagePattern = /(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi;
  const matches = [...html.matchAll(imagePattern)];
  let output = html;

  for (const match of matches) {
    const source = match[2];
    if (/^(?:data:|https?:)/i.test(source)) {
      continue;
    }

    const imagePath = source.replace(/^\.\//, "").startsWith("media/")
      ? path.join(repoRoot, "upstream", source.replace(/^\.\//, ""))
      : path.resolve(path.dirname(sourcePath), source);

    if (!imagePath.startsWith(repoRoot + path.sep) || !fs.existsSync(imagePath)) {
      throw new Error(`Missing or unsafe image path "${source}" in ${path.relative(repoRoot, sourcePath)}.`);
    }

    const extension = path.extname(imagePath).toLowerCase();
    const mimeType = {
      ".gif": "image/gif",
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".webp": "image/webp"
    }[extension];

    if (!mimeType) {
      throw new Error(`Unsupported image type: ${imagePath}`);
    }

    const dataUri = `data:${mimeType};base64,${fs.readFileSync(imagePath).toString("base64")}`;
    output = output.replace(match[0], `${match[1]}${dataUri}${match[3]}`);
  }

  return output;
}

async function launchBrowser() {
  const explicitPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (explicitPath) {
    return chromium.launch({ executablePath: explicitPath, headless: true });
  }

  try {
    return await chromium.launch({ headless: true });
  } catch (defaultError) {
    const candidates = process.platform === "win32"
      ? [
          process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
          process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
          process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
          process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe")
        ].filter(Boolean)
      : [];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return chromium.launch({ executablePath: candidate, headless: true });
      }
    }

    throw new Error(
      `Unable to launch Chromium. Run "pnpm exec playwright install chromium" or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.\n${defaultError.message}`
    );
  }
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
