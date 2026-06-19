/** Remove emoji characters from plain text or HTML strings. */
export function stripEmojis(text: string): string {
  if (!text) return "";

  return text
    .replace(
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
      "",
    )
    .replace(/\uFE0F|\u200D/g, "");
}
