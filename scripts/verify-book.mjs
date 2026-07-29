import { validateBook } from "./book-utils.mjs";
import { createMarkdownParser } from "./markdown.mjs";

const result = validateBook();
const footnoteHtml = createMarkdownParser().parse(
  "正文脚注[^1]\n\n[^1]: 脚注内容"
);

if (!footnoteHtml.includes("data-footnotes") || !footnoteHtml.includes("脚注内容")) {
  throw new Error("Markdown footnote support is not active.");
}

console.log(
  `Validated ${result.details.length} translated chapter(s) against ${result.lock.tag} (${result.lock.commit.slice(0, 12)}).`
);

for (const detail of result.details) {
  console.log(
    `Chapter ${detail.chapter}: ${detail.headings} headings, ${detail.translationStructure.paragraph ?? 0} paragraphs, ${detail.translationStructure.list_item ?? 0} list item(s), ${detail.codeFenceLines / 2} code block(s), ${detail.images} image(s), ${detail.urls} external link(s).`
  );
  console.log(`  Source structure:      ${JSON.stringify(detail.sourceStructure)}`);
  console.log(`  Translation structure: ${JSON.stringify(detail.translationStructure)}`);
}

console.log("Markdown footnote support is active.");
