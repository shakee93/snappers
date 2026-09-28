"use client";

import { useMemo, useState } from "react";
import Input from "shared/Input/Input";
import Label from "@/components/global/primitives/Label/Label";
import { BRAND_CTA_BUTTON_CLASS } from "shared/Button/ButtonBrand";
import { useCoupon } from "@/hooks/useCoupon";
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

  const { applyCouponMutation, applyingCoupon } = useCoupon();

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
        // Toast covers the confirmation and the "You saved" row shows the
        // discount; clear the input for a next code.
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

  return (
    <div>
      {/* Applied coupons force the panel open — no disclosure trigger then,
          so we don't stack a disabled "Discount code" above the field label. */}
      {showTrigger && (
        <button
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

      </div>
    </div>
  );
};

export default CheckoutCouponField;
