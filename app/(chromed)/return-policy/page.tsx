import { Metadata } from "next";

import { LegalPage } from "@/components/global/primitives/LegalPage";
import { readLegalMarkdown } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Return Policy",
};

export const revalidate = 86400;

export default async function PageReturnPolicy() {
  const content = await readLegalMarkdown("return-policy.md");

  return <LegalPage title="Return Policy" content={content} />;
}
