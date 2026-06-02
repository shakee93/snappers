import { Metadata } from "next";

import { LegalMarkdown } from "@/components/primitives/LegalMarkdown";
import { readLegalMarkdown } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default async function PageTerm() {
  const content = await readLegalMarkdown("terms.md");

  return (
    <div className="overflow-hidden relative scroll-smooth" data-nc-id="Pageterms">
      <div className="container py-10 lg:py-10 space-y-16 lg:space-y-28">
        <div className="py-8">
          <h1 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100 pb-6">
            Terms and Conditions.
          </h1>
          <LegalMarkdown content={content} />
        </div>
      </div>
    </div>
  );
}
