import assert from "node:assert/strict";
import { normalizeCodeForComparison } from "./book-utils.mjs";

const source = [
  "/* Print the task name. */",
  "if (ready == pdTRUE) {",
  '    puts("https://example.com/*not-a-comment*/"); // Report the state.',
  "}"
].join("\n");
const translatedComments = [
  "/* 输出任务名称。 */",
  "if (ready == pdTRUE) {",
  '    puts("https://example.com/*not-a-comment*/"); // 报告当前状态。',
  "}"
].join("\n");

assert.equal(normalize(source, "c"), normalize(translatedComments, "c"));

const changedExecutableCode = translatedComments.replace("pdTRUE", "pdFALSE");
assert.notEqual(normalize(source, "c"), normalize(changedExecutableCode, "c"));

const changedString = translatedComments.replace("not-a-comment", "changed");
assert.notEqual(normalize(source, "c"), normalize(changedString, "c"));

const removedComment = translatedComments.replace("/* 输出任务名称。 */\n", "");
assert.notEqual(normalize(source, "c"), normalize(removedComment, "c"));

const rawStringSource =
  'const char *text = R"(say "hello" /* not a comment */ // still text)"; /* Explain it. */';
const translatedRawStringComment =
  'const char *text = R"(say "hello" /* not a comment */ // still text)"; /* 说明该字符串。 */';
assert.equal(normalize(rawStringSource, "cpp"), normalize(translatedRawStringComment, "cpp"));
assert.notEqual(
  normalize(rawStringSource, "cpp"),
  normalize(translatedRawStringComment.replace("still text", "changed text"), "cpp")
);

const sourceConsole = "Task 1 is running";
const translatedConsole = "任务 1 正在运行";
assert.notEqual(
  normalizeCodeForComparison(sourceConsole, "console"),
  normalizeCodeForComparison(translatedConsole, "console")
);

console.log(
  "Code fidelity allows translated C/C++ comments while preserving executable code."
);

function normalize(text, language) {
  return normalizeCodeForComparison(text, language);
}
