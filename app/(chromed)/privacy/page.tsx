import { Metadata } from "next";

import { LegalPage } from "@/components/global/primitives/LegalPage";
import { readLegalMarkdown } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export const revalidate = 86400;

export default async function PagePrivacy() {
  const content = await readLegalMarkdown("privacy.md");

  return <LegalPage title="Privacy Policy" content={content} />;
}
