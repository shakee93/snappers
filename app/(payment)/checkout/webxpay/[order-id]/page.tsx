import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { siteConfig } from "@/site.config";
import WebxpayAutoSubmit, { type WebxpayForm } from "./WebxpayAutoSubmit";

// Builds a fresh encrypted payment form per request; never cache it.
export const dynamic = "force-dynamic";

type WebxpayPaymentPageProps = {
  params: Promise<{ "order-id": string }>;
  searchParams: Promise<{ key?: string }>;
};

function isWebxpayForm(value: unknown): value is WebxpayForm {
  if (typeof value !== "object" || value === null) return false;
  const { action, fields } = value as Record<string, unknown>;
  return (
    typeof action === "string" &&
    action.startsWith("https://") &&
    typeof fields === "object" &&
    fields !== null &&
    Object.values(fields).every((v) => typeof v === "string")
  );
}

// WebXPay only accepts form posts whose Referer is the storefront domain
// registered in its merchant portal, so the backend builds the form and the
// browser submits it from this origin.
async function getWebxpayForm(
  orderId: number,
  key: string,
): Promise<WebxpayForm | null> {
  try {
    const response = await fetch(apiUrl("/wp-json/headless/v1/webxpay-form"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, key }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return isWebxpayForm(data) ? data : null;
  } catch {
    return null;
  }
}

export default async function WebxpayPaymentPage({
  params,
  searchParams,
}: WebxpayPaymentPageProps) {
  const [{ "order-id": orderIdParam }, { key }] = await Promise.all([
    params,
    searchParams,
  ]);
  const orderId = Number(orderIdParam);

  const form =
    Number.isInteger(orderId) && orderId > 0 && key
      ? await getWebxpayForm(orderId, key)
      : null;

  if (form) {
    return <WebxpayAutoSubmit form={form} />;
  }

  return (
    <div className="container mx-auto grid items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Payment could not be started</h1>
      <p className="mt-4 text-gray-600">
        This order may already be paid or is no longer awaiting payment. Please
        don&apos;t place the order again - contact us and we&apos;ll help:
      </p>
      <div className="mt-4 space-y-1">
        <p>
          <span className="font-semibold">Phone:</span>{" "}
          <a href={`tel:${siteConfig.contact.primaryPhone}`} className="text-blue-600 hover:underline">
            {siteConfig.contact.primaryPhoneDisplay}
          </a>
        </p>
        <p>
          <span className="font-semibold">Email:</span>{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-blue-600 hover:underline">
            {siteConfig.contact.email}
          </a>
        </p>
      </div>
      <Link href="/" className="mt-8 font-bold text-blue-500 underline hover:text-blue-800">
        Back to Home
      </Link>
    </div>
  );
}
