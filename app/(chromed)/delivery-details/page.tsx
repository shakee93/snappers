import { Metadata } from "next";

import { LegalPage } from "@/components/global/primitives/LegalPage";
import { readLegalMarkdown } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Delivery Details",
};

export const revalidate = 86400;

export default async function PageDeliveryDetails() {
  const content = await readLegalMarkdown("delivery.md");

  return <LegalPage title="Delivery Terms" content={content} />;
}
