"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  /** When true, WC uses billing as the shipping destination for rate quotes. */
  shippingSameAsBilling: boolean;
}

/**
 * Postcodes WooCommerce can match a shipping zone against. Shared with the
 * checkout form so the step indicator can't call an address complete that
 * this hook then refuses to quote.
 */
export const CHECKOUT_POSTCODE_PATTERN = /^\d{4,6}$/;

// Long enough that typing a city or postcode doesn't fire a mutation per
// keystroke, short enough that a picked city shows its rate before the user
// scrolls to payment. City picks already debounce their own commit at 300ms.
const SYNC_DEBOUNCE_MS = 300;

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

/**
 * WooGraphQL persists the customer address one mutation behind: a single
 * `updateCustomer` does not take effect for the requests that follow it, and
 * its own payload echoes the *previous* address. Verified against this
 * backend — pushing Wellampitiya once left WC with no destination at all, so
 * it quoted the weight fallback ("Standard Shipping", 400) instead of the real
 * rate for that address ("Local Delivery", 450). A silent undercharge, not
 * just a stale label. A second identical push flushes the first one, after
 * which the cart quotes correctly; this held for every address tried.
 *
 * The push is idempotent, so this stays harmless if the backend is fixed to
 * persist on the first write. That fix belongs in gq-backend-plugins — this is
 * a workaround for a backend defect, not a frontend design.
 */
const ADDRESS_PUSHES = 2;

// Pushing a half-typed address makes WC quote against a zone the customer
// isn't in, so wait until every rate-affecting field is actually filled.
// `address1` is in this list because the store's distance-based method prices
// off the geocoded street line — quoting without it returns the store's own
// location as the destination, i.e. the cheapest possible rate.
const isQuotable = (address: CustomerAddressInput) =>
  !!String(address.country ?? "").trim() &&
  !!String(address.state ?? "").trim() &&
  !!String(address.city ?? "").trim() &&
  !!String(address.address1 ?? "").trim() &&
  CHECKOUT_POSTCODE_PATTERN.test(String(address.postcode ?? "").trim());

/**
 * Pushes the checkout address to the WooCommerce customer so shipping is
 * recalculated for the destination the customer actually typed, then runs
 * `onSynced` to pull the refreshed rate and cart.
 *
 * Returns a stable `syncCheckoutAddress` — call it with the current address
 * on every change; it debounces and skips snapshots that are unchanged or
 * not yet complete enough to quote against. `addressSyncing` covers the whole
 * chain, debounce window included, so callers can block submission for as
 * long as the totals on screen might not match the address on screen.
 */
export function useCheckoutAddressSync(onSynced: () => Promise<void> | void) {
  const [updateAddress] = useMutation(UPDATE_ADDRESS);
  const [addressSyncing, setAddressSyncing] = useState(false);

  const lastSyncedKeyRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSyncedRef = useRef(onSynced);
  const isMountedRef = useRef(true);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const syncCheckoutAddress = useCallback(
    (
      snapshot: CheckoutAddressSnapshot | null,
      options?: { immediate?: boolean },
    ) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Nothing to quote, or the server already has this exact address —
      // either way there is no pending work left to block submission on.
      if (!snapshot || !isQuotable(snapshot.shipping)) {
        setAddressSyncing(false);
        return;
      }

      const key = snapshotKey(snapshot);
      if (key === lastSyncedKeyRef.current) {
        setAddressSyncing(false);
        return;
      }

      // Held true across the debounce window too: between a completed address
      // and its refreshed total there is a moment where the displayed total is
      // known-stale, and Confirm must not be live during it.
      setAddressSyncing(true);

      const runSync = async () => {
        timerRef.current = null;

        try {
          for (let push = 0; push < ADDRESS_PUSHES; push += 1) {
            // Omitted fields (email, phone) are merged, not cleared — WC only
            // wipes them when `overwrite` is set — so this is safe to run
            // against a logged-in customer's saved address.
            await updateAddress({
              variables: {
                input: {
                  billing: snapshot.billing,
                  shipping: snapshot.shipping,
                  shippingSameAsBilling: snapshot.shippingSameAsBilling,
                },
              },
            });
          }

          lastSyncedKeyRef.current = key;
        } catch (error) {
          // A failed push only means WC keeps quoting against the previous
          // address — the checkout mutation still sends the full address, so
          // the order itself is unaffected. Leave lastSyncedKeyRef unset so
          // the next edit retries.
          console.error("Failed to sync checkout address for shipping:", error);
          setAddressSyncing(false);
          return;
        }

        // Unmounted mid-flight: the address landed, which is what mattered.
        // Don't drive state on a page that is gone.
        if (!isMountedRef.current) return;

        try {
          await onSyncedRef.current?.();
        } catch (error) {
          // The address landed but the totals didn't refresh. Clear the dedup
          // key so the next snapshot — including a revert to this same
          // address — runs the chain again instead of trusting stale totals.
          console.error("Failed to refresh totals after address sync:", error);
          lastSyncedKeyRef.current = null;
        } finally {
          setAddressSyncing(false);
        }
      };

      // City list picks commit city+postcode as a finished destination — no
      // need to wait out the typing debounce before quoting.
      if (options?.immediate) {
        void runSync();
        return;
      }

      timerRef.current = setTimeout(() => {
        void runSync();
      }, SYNC_DEBOUNCE_MS);
    },
    [updateAddress]
  );

  return { syncCheckoutAddress, addressSyncing };
}
