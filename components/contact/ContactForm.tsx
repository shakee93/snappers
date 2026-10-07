"use client";

import { FormEvent, useState } from "react";
import { BRAND_CTA_BUTTON_CLASS } from "@/shared/Button/ButtonBrand";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ContactFormProps {
  formspreeId: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

const inputClassName =
  "w-full rounded-lg border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-header-green focus:outline-none focus:ring-2 focus:ring-header-green/20";

const ContactForm = ({ formspreeId }: ContactFormProps) => {
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formspreeId) {
      setStatus("error");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[#E8E8E8] bg-white p-8 text-center shadow-lg sm:p-12">
        <CheckCircle2 className="h-12 w-12 text-header-green" aria-hidden />
        <p className="mt-4 text-xl font-bold text-[#092412]">
          Message sent!
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Thanks for reaching out — we&apos;ll get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 text-sm font-semibold text-header-green hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white p-8 shadow-lg sm:p-12">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="text"
            name="name"
            required
            placeholder="Your Name"
            className={inputClassName}
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            required
            placeholder="Your Email"
            className={inputClassName}
          />
        </div>
        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Your Phone"
            className={inputClassName}
          />
        </div>
        <div>
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Your Message"
            className={`${inputClassName} resize-none`}
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600" role="alert">
            {formspreeId
              ? "Something went wrong. Please try again."
              : "Contact form is not configured yet."}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${BRAND_CTA_BUTTON_CLASS}`}
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
