// Match only known production notes, never clinical imaging/review sections.
const EDITORIAL_HEADING = /^##[ \t]+(?:Hero Image Review|Image Review|Hero Image Prompt)[ \t]*\r?$/gm;

export function stripGuideEditorialSections(markdown) {
  return markdown.replace(
    new RegExp(`${EDITORIAL_HEADING.source}\\n?[\\s\\S]*?(?=^#{1,2}[ \\t]+|(?![\\s\\S]))`, "gm"),
    "",
  );
}

// The browser and pre-renderer must expose the same public article body.
export function prepareGuideBody(markdown) {
  const cleaned = stripGuideEditorialSections(markdown);
  const start = cleaned.search(/^## (?:Key Takeaways|Content)\s*$/m);
  const content = start >= 0 ? cleaned.slice(start) : cleaned;
  return content
    .replace(/^## SEO Metadata\s*$[\s\S]*?(?=^#{1,2}\s|(?![\s\S]))/gm, "")
    .trim();
}
