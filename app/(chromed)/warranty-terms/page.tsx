import { Metadata } from "next";

import { LegalMarkdown } from "@/components/global/primitives/LegalMarkdown";
import { readLegalMarkdown } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Warranty Terms",
};

export default async function Warranty() {
  const content = await readLegalMarkdown("warranty.md");

  return (
    <div className="overflow-hidden relative" data-nc-id="PageAbout">
      <div className="container py-10 lg:py-10 space-y-16 lg:space-y-28">
        <div className="py-8">
          <h2 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100 pb-10">
            Warranty
          </h2>
          <LegalMarkdown content={content} />
        </div>
      </div>
    </div>
  );
}
