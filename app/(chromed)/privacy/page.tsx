import { Metadata } from "next";

import { LegalMarkdown } from "@/components/global/primitives/LegalMarkdown";
import { readLegalMarkdown } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PagePrivacy() {
  const content = await readLegalMarkdown("privacy.md");

  return (
    <div className="overflow-hidden relative" data-nc-id="PageAbout">
      <div className="container py-10 lg:py-10 space-y-16 lg:space-y-28">
        <div className="py-8">
          <h2 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100 pb-10">
            Privacy Policy
          </h2>
          <LegalMarkdown content={content} />
        </div>
      </div>
    </div>
  );
}
