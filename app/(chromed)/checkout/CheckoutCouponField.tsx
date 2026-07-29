"use client";

import { useMemo, useRef, useState } from "react";
import Input from "shared/Input/Input";
import Label from "@/components/global/primitives/Label/Label";
import { BRAND_CTA_BUTTON_CLASS } from "shared/Button/ButtonBrand";
import { useCoupon } from "@/hooks/useCoupon";
import { parseWooMoneyAmount } from "@/lib/cartLinePricing";
import { formatPrice } from "@/lib/formatPrice";
import type { AppliedCoupon } from "@/graphql/types/graphql";
import { Loader } from "lucide-react";
import { toast } from "sonner";

const COUPON_FIELD_ID = "checkout-coupon-field";

type CheckoutCouponFieldProps = {
  appliedCoupons?: Array<AppliedCoupon | null> | null;
  refreshCart: () => Promise<unknown>;
  /** True while apply/remove is mid-flight so the order summary can pulse. */
  onSyncingChange: (syncing: boolean) => void;
};

/**
 * Collapsible discount-code field for the checkout order summary.
 * Open when the user reveals it, or when a coupon is already on the cart.
 */
const CheckoutCouponField = ({
  appliedCoupons,
  refreshCart,
  onSyncingChange,
}: CheckoutCouponFieldProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  /** User chose to reveal the input (sticky until they hide it). */
  const [showCouponField, setShowCouponField] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const {
    applyCouponMutation,
    removeCouponsMutation,
    applyingCoupon,
    removingCoupon,
  } = useCoupon();

  const activeCoupons = useMemo(
    () =>
      (appliedCoupons ?? []).filter(
        (coupon): coupon is AppliedCoupon => !!coupon?.code,
      ),
    [appliedCoupons],
  );
  const hasAppliedCoupons = activeCoupons.length > 0;
  // Applied coupons force the panel open — no disclosure trigger then.
  const showTrigger = !hasAppliedCoupons;
  // Open when the user asked, or when a coupon is already on the cart — no
  // useEffect for derived open state (see CLAUDE.md).
  const couponFieldOpen = showCouponField || hasAppliedCoupons;

  const clearStatus = () => {
    setCouponStatus("idle");
    setCouponMessage(null);
  };

  const toggleField = () => {
    setShowCouponField((open) => {
      if (open) clearStatus();
      return !open;
    });
  };

  const handleApply = async () => {
    const code = couponCode.trim();
    if (!code) {
      toast.error("Please enter a coupon code.");
      setCouponStatus("error");
      setCouponMessage("Please enter a coupon code.");
      return;
    }
    try {
      onSyncingChange(true);
      clearStatus();

      const { data } = await applyCouponMutation({
        variables: { code },
      });

      if (data?.applyCoupon?.applied?.code) {
        toast.success("Coupon applied successfully.");
        // Inline success is redundant once the applied chip is on screen —
        // toast covers the confirmation; clear the input for a next code.
        clearStatus();
        setCouponCode("");
        setShowCouponField(true);
        await refreshCart();
      } else {
        const failText = "Coupon could not be applied.";
        toast.error(failText);
        setCouponStatus("error");
        setCouponMessage(failText);
      }
    } catch (error: unknown) {
      const apolloError = error as {
        graphQLErrors?: Array<{ message?: string }>;
        message?: string;
      };
      const rawMessage =
        apolloError?.graphQLErrors?.[0]?.message ||
        apolloError?.message ||
        "Failed to apply coupon.";
      const cleanedMessage = rawMessage.replace(/&quot;/g, '"');
      toast.error(cleanedMessage);
      setCouponStatus("error");
      setCouponMessage(cleanedMessage);
    } finally {
      onSyncingChange(false);
    }
  };

  const handleRemove = async (code: string) => {
    const removingLast = activeCoupons.length === 1;
    try {
      onSyncingChange(true);
      const { data } = await removeCouponsMutation({
        variables: { codes: [code] },
      });

      if (data?.removeCoupons?.cart) {
        toast.success("Coupon removed.");
        // Keep the field open so the customer can enter another code without
        // hunting for the disclosure again (including coupons that arrived
        // already applied, when showCouponField was still false).
        setShowCouponField(true);
        await refreshCart();
        // Last chip unmounts and the disclosure remounts — restore focus so it
        // doesn't fall to <body>. Double rAF waits for the commit that mounts
        // the trigger after appliedCoupons clears.
        if (removingLast) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              triggerRef.current?.focus();
            });
          });
        }
      } else {
        toast.error("Coupon could not be removed.");
      }
    } catch (error: unknown) {
      const apolloError = error as {
        graphQLErrors?: Array<{ message?: string }>;
        message?: string;
      };
      const message =
        apolloError?.graphQLErrors?.[0]?.message ||
        apolloError?.message ||
        "Failed to remove coupon.";
      toast.error(message);
    } finally {
      onSyncingChange(false);
    }
  };

  return (
    <div>
      {/* Applied coupons force the panel open — no disclosure trigger then,
          so we don't stack a disabled "Discount code" above the field label. */}
      {showTrigger && (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleField}
          className="text-sm font-medium text-primary-500 hover:underline"
          aria-expanded={couponFieldOpen}
          aria-controls={COUPON_FIELD_ID}
        >
          {couponFieldOpen ? "Hide" : "Have a coupon?"}
        </button>
      )}

      {/* Prefer the `hidden` attribute over a display utility — Tailwind
          preflight's `[hidden] { display: none }` loses to any `flex`/`block`
          class on the same element. */}
      <div
        id={COUPON_FIELD_ID}
        hidden={!couponFieldOpen}
        className={showTrigger ? "mt-2" : undefined}
      >
        <Label className="text-sm">Discount code</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            sizeClass="h-10 px-4 py-3 !rounded-full"
            className={`flex-1 ${
              couponStatus === "error"
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : couponStatus === "success"
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200"
                  : ""
            }`}
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              if (couponStatus !== "idle") clearStatus();
            }}
            placeholder="Enter coupon code"
          />
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={applyingCoupon}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${BRAND_CTA_BUTTON_CLASS}`}
          >
            {applyingCoupon ? (
              <Loader className="w-4 h-4 animate-spin text-header-green" />
            ) : (
              "Apply coupon"
            )}
          </button>
        </div>

        {couponMessage && (
          <div
            className={`mt-1 flex items-center text-xs ${
              couponStatus === "error"
                ? "text-red-600"
                : couponStatus === "success"
                  ? "text-emerald-600"
                  : "text-slate-500"
            }`}
          >
            <span className="mr-1 text-sm">
              {couponStatus === "error" ? "⚠" : "✓"}
            </span>
            <span>{couponMessage}</span>
          </div>
        )}

        {hasAppliedCoupons && (
          <div className="mt-3 space-y-1">
            <span className="text-xs font-medium text-emerald-600">
              Coupon{activeCoupons.length > 1 ? "s" : ""} applied:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeCoupons.map((applied) => {
                const discount = parseWooMoneyAmount(applied.discountAmount);
                return (
                  <div
                    key={applied.code}
                    className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
                  >
                    <span className="font-semibold uppercase">{applied.code}</span>
                    {Number.isFinite(discount) && discount > 0 && (
                      <span className="ml-2">({formatPrice(discount)} off)</span>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleRemove(applied.code)}
                      disabled={removingCoupon}
                      className="ml-2 text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-200 disabled:opacity-60"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutCouponField;
