"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_SESSION } from "@/graphql/defs/cart";

/**
 * Pushes the selected payment gateway into the WooCommerce session
 * (`chosen_payment_method`) so plugins that reprice by payment method
 * (woo-price-tiers, fees, etc.) can recalculate the cart, then runs
 * `onSynced` to pull the refreshed totals — same shape as address sync.
 *
 * Concurrent calls are generation-guarded: only the latest sync may clear
 * `paymentSyncing` or invoke `onSynced`.
 */
export function useCheckoutPaymentSync(onSynced: () => Promise<void> | void) {
  const [updateSession] = useMutation(UPDATE_SESSION);
  const [paymentSyncing, setPaymentSyncing] = useState(false);

  const lastSyncedGatewayRef = useRef<string | null>(null);
  const onSyncedRef = useRef(onSynced);
  const isMountedRef = useRef(true);
  const syncGenerationRef = useRef(0);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      syncGenerationRef.current += 1;
    };
  }, []);

  const syncCheckoutPaymentMethod = useCallback(
    (gatewayId: string | null | undefined) => {
      const generation = ++syncGenerationRef.current;
      const isCurrent = () =>
        isMountedRef.current && syncGenerationRef.current === generation;

      if (!gatewayId) {
        if (isCurrent()) setPaymentSyncing(false);
        return;
      }

      if (gatewayId === lastSyncedGatewayRef.current) {
        if (isCurrent()) setPaymentSyncing(false);
        return;
      }

      setPaymentSyncing(true);
      // In flux until this generation lands — don't let a revert short-circuit
      // on a stale lastSyncedGatewayRef while WC still quotes the old method.
      lastSyncedGatewayRef.current = null;

      const runSync = async () => {
        if (!isCurrent()) return;

        try {
          // WooCommerce stores the active gateway as chosen_payment_method.
          // Fee / price-tier plugins read that session key during calculate_totals.
          await updateSession({
            variables: {
              input: {
                sessionData: [
                  { key: "chosen_payment_method", value: gatewayId },
                ],
              },
            },
          });
          if (!isCurrent()) return;
          lastSyncedGatewayRef.current = gatewayId;
        } catch (error) {
          console.error(
            "Failed to sync checkout payment method for totals:",
            error,
          );
          if (isCurrent()) setPaymentSyncing(false);
          return;
        }

        if (!isCurrent()) return;

        try {
          await onSyncedRef.current?.();
        } catch (error) {
          console.error(
            "Failed to refresh totals after payment method sync:",
            error,
          );
          if (isCurrent()) lastSyncedGatewayRef.current = null;
        } finally {
          if (isCurrent()) setPaymentSyncing(false);
        }
      };

      void runSync();
    },
    [updateSession],
  );

  return { syncCheckoutPaymentMethod, paymentSyncing };
}
