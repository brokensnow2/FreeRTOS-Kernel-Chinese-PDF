import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMarkdownParser } from "./markdown.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(scriptDirectory, "..");

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

export function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

export function stripInlineMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~]/g, "")
    .trim();
}

export function extractHeadings(markdown) {
  const headings = [];
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) {
      continue;
    }

    const text = stripInlineMarkdown(match[2]);
    const section = /^(\d+(?:\.\d+)*)\b/.exec(text)?.[1] ?? null;
    headings.push({
      depth: match[1].length,
      text,
      section,
      slug: githubSlug(text)
    });
  }

  return headings;
}

export function githubSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-");
}

export function extractAnchors(markdown) {
  return new Set(
    [...markdown.matchAll(/<a\s+(?:id|name)=["']([^"']+)["'][^>]*>/gi)].map(
      (match) => match[1]
    )
  );
}

export function extractImageReferences(markdown) {
  const references = new Set();

  for (const match of markdown.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    references.add(match[1]);
  }

  for (const match of markdown.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    references.add(match[1]);
  }

  return [...references].sort();
}

export function countFenceLines(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\s*(```|~~~)/.test(line)).length;
}

export function extractExternalUrls(markdown) {
  return [
    ...new Set(
      [...markdown.matchAll(/https?:\/\/[^\s<>)\]]+/g)].map((match) =>
        match[0].replace(/[.,;:!?]+$/g, "")
      )
    )
  ].sort();
}

export function summarizeMarkdownStructure(markdown) {
  const parser = createMarkdownParser();
  const tokens = parser.lexer(markdown);
  const counts = {};

  parser.walkTokens(tokens, (token) => {
    counts[token.type] = (counts[token.type] ?? 0) + 1;
  });

  return counts;
}

export function validateBook() {
  const lock = readJson("upstream/upstream.lock.json");
  const config = readJson("zh-CN/book.json");
  const errors = [];
  const details = [];

  if (config.source.tag !== lock.tag || config.source.commit !== lock.commit) {
    errors.push("zh-CN/book.json does not match upstream/upstream.lock.json.");
  }

  for (const relativePath of config.files) {
    if (!fs.existsSync(path.join(repoRoot, relativePath))) {
      errors.push(`Missing configured file: ${relativePath}`);
    }
  }

  for (const chapter of config.chapters) {
    const sourcePath = path.join(repoRoot, chapter.source);
    const translationPath = path.join(repoRoot, chapter.translation);

    if (!fs.existsSync(sourcePath) || !fs.existsSync(translationPath)) {
      errors.push(`Missing chapter pair: ${chapter.source} / ${chapter.translation}`);
      continue;
    }

    const source = fs.readFileSync(sourcePath, "utf8");
    const translation = fs.readFileSync(translationPath, "utf8");
    const sourceHeadings = extractHeadings(source);
    const translationHeadings = extractHeadings(translation);
    const anchors = extractAnchors(translation);

    if (sourceHeadings.length !== translationHeadings.length) {
      errors.push(
        `${chapter.translation}: heading count ${translationHeadings.length} does not match source count ${sourceHeadings.length}.`
      );
    }

    for (let index = 0; index < Math.min(sourceHeadings.length, translationHeadings.length); index += 1) {
      const sourceHeading = sourceHeadings[index];
      const translationHeading = translationHeadings[index];

      if (sourceHeading.depth !== translationHeading.depth) {
        errors.push(
          `${chapter.translation}: heading level mismatch at "${translationHeading.text}".`
        );
      }

      if (sourceHeading.section && sourceHeading.section !== translationHeading.section) {
        errors.push(
          `${chapter.translation}: section number "${translationHeading.section}" does not match "${sourceHeading.section}".`
        );
      }

      if (!anchors.has(sourceHeading.slug)) {
        errors.push(
          `${chapter.translation}: missing stable source anchor "${sourceHeading.slug}".`
        );
      }
    }

    if (countFenceLines(source) !== countFenceLines(translation)) {
      errors.push(`${chapter.translation}: fenced code block markers do not match the source.`);
    }

    const sourceImages = extractImageReferences(source);
    const translationImages = extractImageReferences(translation);
    if (JSON.stringify(sourceImages) !== JSON.stringify(translationImages)) {
      errors.push(`${chapter.translation}: image references do not match the source.`);
    }

    const sourceUrls = extractExternalUrls(source);
    const translationUrls = extractExternalUrls(translation);
    if (JSON.stringify(sourceUrls) !== JSON.stringify(translationUrls)) {
      errors.push(`${chapter.translation}: external links do not match the source.`);
    }

    const sourceStructure = summarizeMarkdownStructure(source);
    const translationStructure = summarizeMarkdownStructure(translation);
    const structuralTokenTypes = [
      "heading",
      "list",
      "list_item",
      "code",
      "table",
      "blockquote",
      "image",
      "link"
    ];

    for (const tokenType of structuralTokenTypes) {
      const sourceCount = sourceStructure[tokenType] ?? 0;
      const translationCount = translationStructure[tokenType] ?? 0;
      if (sourceCount !== translationCount) {
        errors.push(
          `${chapter.translation}: ${tokenType} token count ${translationCount} does not match source count ${sourceCount}.`
        );
      }
    }

    details.push({
      chapter: chapter.number,
      headings: translationHeadings.length,
      codeFenceLines: countFenceLines(translation),
      images: translationImages.length,
      sourceStructure,
      translationStructure,
      urls: translationUrls.length
    });
  }

  const toc = readText("zh-CN/toc.md");
  const chapterAnchors = new Map();
  for (const chapter of config.chapters) {
    chapterAnchors.set(
      path.basename(chapter.translation),
      extractAnchors(readText(chapter.translation))
    );
  }

  for (const match of toc.matchAll(/\((ch\d+\.md)#([^)]+)\)/g)) {
    const anchors = chapterAnchors.get(match[1]);
    if (!anchors?.has(match[2])) {
      errors.push(`zh-CN/toc.md contains an unresolved target: ${match[1]}#${match[2]}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Book validation failed:\n- ${errors.join("\n- ")}`);
  }

  return { config, lock, details };
}
