"use client";
import { useEffect, useRef } from "react";

export type WebxpayForm = {
  action: string;
  fields: Record<string, string>;
};

export default function WebxpayAutoSubmit({ form }: { form: WebxpayForm }) {
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    formRef.current?.submit();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-current border-r-transparent opacity-40"
        role="status"
        aria-label="Redirecting to payment"
      />
      <p className="mt-5 text-base">Redirecting to payment…</p>
      <p className="mt-2 text-sm text-gray-500">
        Please do not close or refresh this page.
      </p>

      <form ref={formRef} action={form.action} method="post" className="mt-6">
        {Object.entries(form.fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <noscript>
          <button type="submit" className="rounded-md border px-5 py-2.5">
            Continue to payment
          </button>
        </noscript>
      </form>
    </div>
  );
}
