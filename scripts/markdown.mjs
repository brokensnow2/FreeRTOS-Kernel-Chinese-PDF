import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import { Marked } from "marked";
import markedFootnote from "marked-footnote";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);

const languageAliases = new Map([
  ["c++", "cpp"],
  ["cxx", "cpp"],
  ["h", "c"],
  ["hpp", "cpp"],
  ["shell", "bash"],
  ["sh", "bash"],
  ["zsh", "bash"]
]);

export function createMarkdownParser() {
  return new Marked({
    breaks: false,
    gfm: true
  }).use(
    markedFootnote({
      description: "注释",
      footnoteDivider: true,
      refMarkers: true
    }),
    {
      renderer: {
        code({ text, lang }) {
          const sourceLanguage = lang?.trim().split(/\s+/, 1)[0] ?? "";
          const language = languageAliases.get(sourceLanguage) ?? sourceLanguage;
          const canHighlight = language && hljs.getLanguage(language);
          const classes = ["code-block__source"];
          let renderedCode;

          if (canHighlight) {
            classes.push("hljs", `language-${escapeAttribute(language)}`);
            renderedCode = hljs.highlight(text, {
              language,
              ignoreIllegals: true
            }).value;
          } else {
            classes.push("nohighlight");
            if (sourceLanguage) {
              classes.push(`language-${escapeAttribute(sourceLanguage)}`);
            }
            renderedCode = escapeHtml(text);
          }

          return `<pre><code class="${classes.join(" ")}">${renderedCode}\n</code></pre>\n`;
        }
      }
    }
  );
}

function escapeAttribute(value) {
  return String(value).replace(/[^\w+-]/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
