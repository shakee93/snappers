import { readFile } from "node:fs/promises";
import path from "node:path";

export async function readLegalMarkdown(fileName: string): Promise<string> {
  const fullPath = path.join(process.cwd(), "content", "legal", fileName);
  return readFile(fullPath, "utf8");
}
