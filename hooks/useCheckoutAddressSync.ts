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

type AddressFieldSource = {
  country?: string | null;
  state?: string | null;
  city?: string | null;
  postcode?: string | null;
  address1?: string | null;
  address2?: string | null;
  firstName?: string | null;
  lastName?: string | null;
} | null | undefined;

// Full address for dedupe - every field the customer edits is worth pushing.
// Shipping plugins / per-address rules can key on street lines and names, and
// the customer expects the total to respond to whatever they just changed.
// (Echo comparison uses RATE_KEY_FIELDS below, which is intentionally narrower.)
const FULL_KEY_FIELDS = [
  "country",
  "state",
  "city",
  "postcode",
  "address1",
  "address2",
  "firstName",
  "lastName",
] as const;

// Rate-affecting fields only for the updateCustomer echo check. Omitting
// address2 / name avoids permanent mismatch when WC merges a saved apartment
// line the form never sent - which would force a second push every time.
const RATE_KEY_FIELDS = [
  "country",
  "state",
  "city",
  "postcode",
  "address1",
] as const;

const fieldKey = (
  address: AddressFieldSource,
  fields: readonly (keyof NonNullable<AddressFieldSource>)[],
) =>
  fields
    .map((field) => String(address?.[field] ?? "").trim().toLowerCase())
    .join("|");

const snapshotKey = (snapshot: CheckoutAddressSnapshot) =>
  `${fieldKey(snapshot.billing, FULL_KEY_FIELDS)}>>${fieldKey(snapshot.shipping, FULL_KEY_FIELDS)}`;

/**
 * WooGraphQL can persist the customer address one mutation behind: a single
 * `updateCustomer` sometimes does not take effect for the requests that follow
 * it, and its own payload echoes the *previous* address. Verified against this
 * backend - pushing Wellampitiya once left WC with no destination at all, so
 * it quoted the weight fallback ("Standard Shipping", 400) instead of the real
 * rate for that address ("Local Delivery", 450). A silent undercharge, not
 * just a stale label.
 *
 * Push once, then push again only when the echoed shipping address still
 * mismatches what we sent on rate-affecting fields. Healthy backends pay one
 * round trip; the laggy case still gets the second flush.
 *
 * Remove the retry *and* the console.warn below together once the backend
 * defect is fixed - track under gq-backend-plugins (WooGraphQL updateCustomer
 * address lag). Watch the network tab: a healthy push should fire one
 * `updateCustomerAddress`; a warn means the echo comparison forced a retry
 * (state normalisation is the field most likely to trip this).
 */
const mismatchedRateFields = (
  sent: CustomerAddressInput,
  echoed: AddressFieldSource,
): string[] => {
  if (!echoed) return [...RATE_KEY_FIELDS];
  return RATE_KEY_FIELDS.filter((field) => {
    const a = String(sent[field] ?? "").trim().toLowerCase();
    const b = String(echoed[field] ?? "").trim().toLowerCase();
    return a !== b;
  });
};

// Pushing a half-typed address makes WC quote against a zone the customer
// isn't in, so wait until every rate-affecting field is actually filled.
// `address1` is in this list because the store's distance-based method prices
// off the geocoded street line - quoting without it returns the store's own
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
 * Returns a stable `syncCheckoutAddress` - call it with the current address
 * on every change; it debounces and skips snapshots that are unchanged or
 * not yet complete enough to quote against. `addressSyncing` covers the whole
 * chain, debounce window included, so callers can block submission for as
 * long as the totals on screen might not match the address on screen.
 *
 * Concurrent calls are generation-guarded: only the latest sync may clear
 * `addressSyncing`, write `lastSyncedKeyRef`, or invoke `onSynced`. The
 * generation bump runs on early-return paths too so a superseded in-flight
 * chain cannot clear Confirm while a newer destination is pending.
 */
export function useCheckoutAddressSync(onSynced: () => Promise<void> | void) {
  const [updateAddress] = useMutation(UPDATE_ADDRESS);
  const [addressSyncing, setAddressSyncing] = useState(false);

  const lastSyncedKeyRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      if (timerRef.current) clearTimeout(timerRef.current);
      // Invalidate any in-flight chain so it cannot write after unmount.
      syncGenerationRef.current += 1;
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

      // Bump generation on every call - including "nothing to do" paths - so
      // an older in-flight runSync cannot clear addressSyncing or applyCart
      // after a newer destination has already been requested. That also makes
      // the A→B→A race reachable: reverting to A while B is in flight must not
      // trust lastSyncedKeyRef from the earlier A push (WC may already be on B).
      const generation = ++syncGenerationRef.current;
      const isCurrent = () =>
        isMountedRef.current && syncGenerationRef.current === generation;

      // Nothing to quote - no pending work left to block submission on.
      // Deliberately do NOT clear lastSyncedKeyRef here: an incomplete edit
      // shouldn't force a re-push of the last good address on the next tick.
      if (!snapshot || !isQuotable(snapshot.shipping)) {
        if (isCurrent()) setAddressSyncing(false);
        return;
      }

      const key = snapshotKey(snapshot);
      if (key === lastSyncedKeyRef.current) {
        if (isCurrent()) setAddressSyncing(false);
        return;
      }

      // Held true across the debounce window too: between a completed address
      // and its refreshed total there is a moment where the displayed total is
      // known-stale, and Confirm must not be live during it.
      setAddressSyncing(true);
      // From here the server's address is in flux (this push, or a superseded
      // one still landing). No key is known-good until this generation's
      // pushes complete - otherwise reverting to a prior address short-circuits
      // on a stale lastSyncedKeyRef while WC still quotes the abandoned one.
      lastSyncedKeyRef.current = null;

      const runSync = async () => {
        timerRef.current = null;
        if (!isCurrent()) return;

        try {
          const pushInput = {
            billing: snapshot.billing,
            shipping: snapshot.shipping,
            shippingSameAsBilling: snapshot.shippingSameAsBilling,
          };

          // Omitted fields (email, phone) are merged, not cleared - WC only
          // wipes them when `overwrite` is set - so this is safe to run
          // against a logged-in customer's saved address.
          const { data: firstPush } = await updateAddress({
            variables: { input: pushInput },
          });
          if (!isCurrent()) return;

          const echoedShipping = firstPush?.updateCustomer?.customer?.shipping;
          const mismatched = mismatchedRateFields(
            snapshot.shipping,
            echoedShipping,
          );
          if (mismatched.length > 0) {
            // Remove with the retry once backend address lag is fixed.
            console.warn(
              "[checkout] updateCustomer echo mismatched; retrying push. Fields:",
              mismatched.join(", "),
            );
            await updateAddress({
              variables: { input: pushInput },
            });
            if (!isCurrent()) return;
          }

          lastSyncedKeyRef.current = key;
        } catch (error) {
          // A failed push only means WC keeps quoting against the previous
          // address - the checkout mutation still sends the full address, so
          // the order itself is unaffected. Leave lastSyncedKeyRef unset so
          // the next edit retries.
          console.error("Failed to sync checkout address for shipping:", error);
          if (isCurrent()) setAddressSyncing(false);
          return;
        }

        // Unmounted mid-flight / superseded: the address may have landed,
        // but don't drive state or refresh totals for a stale generation.
        if (!isCurrent()) return;

        try {
          await onSyncedRef.current?.();
        } catch (error) {
          // The address landed but the totals didn't refresh. Clear the dedup
          // key so the next snapshot - including a revert to this same
          // address - runs the chain again instead of trusting stale totals.
          console.error("Failed to refresh totals after address sync:", error);
          if (isCurrent()) lastSyncedKeyRef.current = null;
        } finally {
          if (isCurrent()) setAddressSyncing(false);
        }
      };

      // City list picks commit city+postcode as a finished destination - no
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
