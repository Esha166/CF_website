const allowedTags = /<(\/?)(p|strong|b|em|i|u|ul|ol|li|br)>/gi;

export function sanitizeJobDescription(value: string): string {
  return value
    .replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/<[^>]*>/g, (tag) => {
      const allowedTag = tag.match(allowedTags);
      return allowedTag ? allowedTag[0] : "";
    });
}

export function jobDescriptionText(value: string): string {
  return sanitizeJobDescription(value)
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}
