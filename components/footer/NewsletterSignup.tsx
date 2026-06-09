"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/site.config";

/**
 * Newsletter email capture shown in the footer. Presentational submit that
 * confirms inline — wire to a backend endpoint when one is available.
 */
export default function NewsletterSignup() {
  const { placeholder, buttonLabel } = siteConfig.footer.newsletter;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-sm font-medium text-white" role="status">
        Thanks for subscribing!
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        aria-label="Email address"
        className="flex-1 rounded-md bg-white px-4 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
      />
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-md bg-[#ACDA5A] px-5 py-2.5 text-base font-semibold text-black transition-colors hover:bg-[#b4d653]"
      >
        {buttonLabel}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
