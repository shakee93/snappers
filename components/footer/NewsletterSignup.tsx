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
      className="flex w-full max-w-md flex-wrap items-center gap-2 sm:flex-nowrap"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        aria-label="Email address"
        className="w-full rounded-md bg-white px-4 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:flex-1"
      />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-header-action px-6 py-2.5 text-base font-bold text-header-green transition-opacity hover:opacity-90 sm:w-auto"
      >
        {buttonLabel}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
