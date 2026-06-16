import { Metadata } from "next";

import { LegalPage } from "@/components/global/primitives/LegalPage";
import { readLegalMarkdown } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Warranty Terms",
};

export const revalidate = 86400;

export default async function Warranty() {
  const content = await readLegalMarkdown("warranty.md");

  return <LegalPage title="Warranty" content={content} />;
}
