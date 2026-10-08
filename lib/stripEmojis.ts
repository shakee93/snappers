/** Remove emoji characters from plain text or HTML strings. */
export function stripEmojis(text: string): string {
  if (!text) return "";

  // Surrogate-pair emoji blocks plus common symbol ranges - avoids stripping
  // typographic punctuation (en/em dashes, curly quotes, bullets, etc.).
  return text
    .replace(
      /(?:[\u2600-\u26FF]|[\u2700-\u27BF]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
      "",
    )
    .replace(/[\uFE0F\u200D]/g, "");
}
