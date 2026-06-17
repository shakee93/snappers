"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { useSession } from "@/context/SessionProvider";
import {
  ADD_TO_WISHLIST,
  AddToWishlistResult,
  GET_WISHLIST,
  GetWishlistResult,
  REMOVE_FROM_WISHLIST,
  RemoveFromWishlistResult,
} from "@/graphql/defs/wishlist";

type WishlistContextValue = {
  /** Product database IDs in the wishlist, newest first. */
  ids: number[];
  count: number;
  /** True once the first server fetch for a logged-in user has resolved. */
  ready: boolean;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  /** Add when absent, remove when present. Returns the resulting membership. */
  toggle: (productId: number) => Promise<boolean>;
  remove: (productId: number) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue>({
  ids: [],
  count: 0,
  ready: false,
  loading: false,
  isInWishlist: () => false,
  toggle: async () => false,
  remove: async () => {},
});

export function useWishlist() {
  return useContext(WishlistContext);
}

const toIdList = (raw?: (number | null)[] | null): number[] =>
  (raw ?? []).filter((id): id is number => typeof id === "number");

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { customer } = useSession();
  const isLoggedIn = !!customer && customer.id !== "guest";

  // Set is the membership source of truth (O(1) lookups for bulk-rendered
  // cards); `order` preserves the server's newest-first sequence for listing.
  const [ids, setIds] = useState<number[]>([]);
  const idSet = useMemo(() => new Set(ids), [ids]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fetchWishlist] = useLazyQuery<GetWishlistResult>(GET_WISHLIST, {
    fetchPolicy: "no-cache",
  });
  const [addMutation] = useMutation<AddToWishlistResult>(ADD_TO_WISHLIST, {
    fetchPolicy: "no-cache",
  });
  const [removeMutation] = useMutation<RemoveFromWishlistResult>(
    REMOVE_FROM_WISHLIST,
    { fetchPolicy: "no-cache" },
  );

  // Re-fetch whenever the auth identity changes; clear on logout.
  const customerKey = isLoggedIn ? customer?.id : null;
  useEffect(() => {
    let cancelled = false;

    if (!isLoggedIn) {
      setIds([]);
      setReady(false);
      return;
    }

    setLoading(true);
    fetchWishlist()
      .then(({ data }) => {
        if (cancelled) return;
        setIds(toIdList(data?.wishlist));
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // customerKey captures login/identity transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerKey]);

  const isInWishlist = useCallback(
    (productId: number) => idSet.has(productId),
    [idSet],
  );

  // Serialize writes so rapid toggles don't race the optimistic state.
  const pending = useRef<Promise<unknown>>(Promise.resolve());

  const add = useCallback(
    async (productId: number) => {
      const previous = ids;
      // Optimistic: prepend (newest first), mirroring the backend ordering.
      setIds((current) =>
        current.includes(productId) ? current : [productId, ...current],
      );
      try {
        const { data } = await addMutation({ variables: { productId } });
        const next = data?.addToWishlist?.wishlist;
        if (next) setIds(toIdList(next));
      } catch {
        setIds(previous);
        toast.error("Couldn't update your wishlist. Please try again.");
        throw new Error("wishlist-add-failed");
      }
    },
    [addMutation, ids],
  );

  const removeId = useCallback(
    async (productId: number) => {
      const previous = ids;
      setIds((current) => current.filter((id) => id !== productId));
      try {
        const { data } = await removeMutation({ variables: { productId } });
        const next = data?.removeFromWishlist?.wishlist;
        if (next) setIds(toIdList(next));
      } catch {
        setIds(previous);
        toast.error("Couldn't update your wishlist. Please try again.");
        throw new Error("wishlist-remove-failed");
      }
    },
    [removeMutation, ids],
  );

  const toggle = useCallback(
    async (productId: number) => {
      const willAdd = !idSet.has(productId);
      const run = () => (willAdd ? add(productId) : removeId(productId));
      // Chain onto any in-flight write to keep optimistic state consistent.
      pending.current = pending.current.then(run, run);
      await pending.current;
      return willAdd;
    },
    [add, removeId, idSet],
  );

  const remove = useCallback(
    async (productId: number) => {
      pending.current = pending.current.then(
        () => removeId(productId),
        () => removeId(productId),
      );
      await pending.current;
    },
    [removeId],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.length,
      ready,
      loading,
      isInWishlist,
      toggle,
      remove,
    }),
    [ids, ready, loading, isInWishlist, toggle, remove],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
