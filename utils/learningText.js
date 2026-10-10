import sanitizeHtml from "sanitize-html";

export function sanitizeArticle(content) {
  let heading = 0;
  return sanitizeHtml(content || "", {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "b",
      "i",
      "a",
      "br",
      "blockquote",
      "pre",
      "code",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: { a: ["href", "target", "rel"], h2: ["id"], h3: ["id"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, rel: "noopener noreferrer" },
      }),
      h2: (tagName) => ({ tagName, attribs: { id: "section-" + ++heading } }),
      h3: (tagName) => ({ tagName, attribs: { id: "section-" + ++heading } }),
    },
  });
}

export function plainText(html) {
  return sanitizeHtml(html || "", { allowedTags: [], allowedAttributes: {} });
}

export function articleHeadings(content) {
  return [...content.matchAll(/<h[23] id="([^"]+)">([\s\S]*?)<\/h[23]>/g)].map(
    (match) => ({ id: match[1], title: plainText(match[2]) }),
  );
}
