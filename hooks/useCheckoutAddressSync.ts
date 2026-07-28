"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_ADDRESS } from "@/graphql/defs/order";
import { CustomerAddressInput } from "@/graphql/types/graphql";

/**
 * Billing + shipping address as the checkout form currently has them. WC
 * quotes rates against the shipping address, so that is the one we gate on.
 */
export interface CheckoutAddressSnapshot {
  billing: CustomerAddressInput;
  shipping: CustomerAddressInput;
}

// Long enough that typing a city or postcode doesn't fire a mutation per
// keystroke, short enough that the rate lands before the user reaches the
// payment section.
const SYNC_DEBOUNCE_MS = 700;

// Every address field is worth pushing, not just the ones core WC matches
// zones on: shipping plugins and per-address rules can key on the street
// lines, and the customer expects the total to respond to whatever they just
// edited. Deduping still skips renders where nothing in the address moved.
const addressKey = (address: CustomerAddressInput) =>
  [
    address.country,
    address.state,
    address.city,
    address.postcode,
    address.address1,
    address.address2,
    address.firstName,
    address.lastName,
  ]
    .map((part) => String(part ?? "").trim().toLowerCase())
    .join("|");

const snapshotKey = (snapshot: CheckoutAddressSnapshot) =>
  `${addressKey(snapshot.billing)}>>${addressKey(snapshot.shipping)}`;

// Pushing a half-typed address makes WC quote against a zone the customer
// isn't in, so wait until every rate-affecting field is actually filled.
const isQuotable = (address: CustomerAddressInput) =>
  !!String(address.country ?? "").trim() &&
  !!String(address.state ?? "").trim() &&
  !!String(address.city ?? "").trim() &&
  /^\d{4,6}$/.test(String(address.postcode ?? "").trim());

/**
 * Pushes the checkout address to the WooCommerce customer so shipping is
 * recalculated for the destination the customer actually typed, then runs
 * `onSynced` to pull the refreshed rate and cart.
 *
 * Returns a stable `syncCheckoutAddress` — call it with the current address
 * on every change; it debounces and skips snapshots that are unchanged or
 * not yet complete enough to quote against.
 */
export function useCheckoutAddressSync(onSynced: () => Promise<void> | void) {
  const [updateAddress, { loading: addressSyncing }] = useMutation(UPDATE_ADDRESS);

  const lastSyncedKeyRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSyncedRef = useRef(onSynced);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const syncCheckoutAddress = useCallback(
    (snapshot: CheckoutAddressSnapshot | null) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (!snapshot || !isQuotable(snapshot.shipping)) return;

      const key = snapshotKey(snapshot);
      if (key === lastSyncedKeyRef.current) return;

      timerRef.current = setTimeout(async () => {
        timerRef.current = null;

        try {
          // Omitted fields (email, phone) are merged, not cleared — WC only
          // wipes them when `overwrite` is set — so this is safe to run
          // against a logged-in customer's saved address.
          await updateAddress({
            variables: {
              input: {
                billing: snapshot.billing,
                shipping: snapshot.shipping,
              },
            },
          });
          lastSyncedKeyRef.current = key;
        } catch (error) {
          // A failed push only means WC keeps quoting against the previous
          // address — the checkout mutation still sends the full address, so
          // the order itself is unaffected. Leave lastSyncedKeyRef unset so
          // the next edit retries.
          console.error("Failed to sync checkout address for shipping:", error);
          return;
        }

        try {
          await onSyncedRef.current?.();
        } catch (error) {
          // The address landed; only the follow-up refresh failed, so the
          // displayed totals are stale until the next recalculation.
          console.error("Failed to refresh totals after address sync:", error);
        }
      }, SYNC_DEBOUNCE_MS);
    },
    [updateAddress]
  );

  return { syncCheckoutAddress, addressSyncing };
}
