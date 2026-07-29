import { Marked } from "marked";
import markedFootnote from "marked-footnote";

export function createMarkdownParser() {
  return new Marked({
    breaks: false,
    gfm: true
  }).use(
    markedFootnote({
      description: "注释",
      footnoteDivider: true,
      refMarkers: true
    })
  );
}
