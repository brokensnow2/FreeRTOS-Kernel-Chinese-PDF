import assert from "node:assert/strict";
import { createMarkdownParser } from "./markdown.mjs";

const parser = createMarkdownParser();
const fence = "`".repeat(3);
const cSource = [
  "/* Keep this English comment unchanged. */",
  "if (ready == pdTRUE) {",
  '    puts("running");',
  "}"
].join("\n");
const cHtml = parser.parse(`${fence}c\n${cSource}\n${fence}`);

assert.match(cHtml, /class="[^"]*\bhljs\b[^"]*\blanguage-c\b[^"]*"/);
assert.match(cHtml, /class="hljs-comment"/);
assert.match(cHtml, /class="hljs-keyword"/);
assert.match(cHtml, /class="hljs-string"/);
assert.equal(extractCodeText(cHtml), `${cSource}\n`);

const shellSource = 'printf "%s\\n" "$HOME"';
const shellHtml = parser.parse(`${fence}sh\n${shellSource}\n${fence}`);

assert.match(shellHtml, /class="[^"]*\bhljs\b[^"]*\blanguage-bash\b[^"]*"/);
assert.equal(extractCodeText(shellHtml), `${shellSource}\n`);

const consoleSource = "C:\\Temp>rtosdemo\nTask 1 is running";
const consoleHtml = parser.parse(`${fence}console\n${consoleSource}\n${fence}`);

assert.match(consoleHtml, /\bnohighlight\b/);
assert.doesNotMatch(consoleHtml, /\bhljs-comment\b|\bhljs-keyword\b/);
assert.equal(extractCodeText(consoleHtml), `${consoleSource}\n`);

const treeSource = "FreeRTOS\n|-- Source\n`-- Demo";
const treeHtml = parser.parse(`${fence}\n${treeSource}\n${fence}`);

assert.match(treeHtml, /\bnohighlight\b/);
assert.doesNotMatch(treeHtml, /\blanguage-/);
assert.equal(extractCodeText(treeHtml), `${treeSource}\n`);

console.log("Syntax highlighting preserves code text and styles supported languages.");

function extractCodeText(html) {
  const innerHtml = /<code\b[^>]*>([\s\S]*?)<\/code>/.exec(html)?.[1];
  assert.notEqual(innerHtml, undefined, "Rendered HTML does not contain a code element.");

  return innerHtml
    .replace(/<\/?span\b[^>]*>/g, "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}
