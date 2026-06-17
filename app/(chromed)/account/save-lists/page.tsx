"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useLazyQuery } from "@apollo/client";
import { useSession } from "@/context/SessionProvider";
import { useWishlist } from "@/context/WishlistProvider";
import { GET_WISHLIST_PRODUCTS } from "@/graphql/defs/products";
import ProductCard, { ProductCardItem } from "@/components/home/ProductCard";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

const AccountSavelists = () => {
  const { customer } = useSession();
  const { ids, ready } = useWishlist();
  const isLoggedIn = !!customer && customer.id !== "guest";

  const [fetchProducts, { data, loading }] = useLazyQuery(GET_WISHLIST_PRODUCTS, {
    fetchPolicy: "cache-and-network",
  });

  // Re-fetch product details whenever the set of wishlist ids changes.
  const idsKey = ids.join(",");
  useEffect(() => {
    if (!isLoggedIn || ids.length === 0) return;
    fetchProducts({ variables: { ids } });
    // idsKey captures membership changes without re-running on array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, isLoggedIn]);

  // Keep only products still on the wishlist (so a just-removed card drops
  // instantly), then re-sort to newest-first — WooGraphQL ignores `include` order.
  const products = useMemo(() => {
    const nodes: ProductCardItem[] = data?.products?.nodes ?? [];
    const order = new Map(ids.map((id, index) => [id, index]));
    return nodes
      .filter((node) => order.has(node.databaseId ?? -1))
      .sort(
        (a, b) =>
          (order.get(a.databaseId ?? -1) ?? Infinity) -
          (order.get(b.databaseId ?? -1) ?? Infinity),
      );
  }, [data, ids]);

  const renderBody = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="text-slate-500">
            Please log in to view your saved products.
          </p>
          <ButtonPrimary href="/login">Log in</ButtonPrimary>
        </div>
      );
    }

    if (ids.length === 0 && ready) {
      return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="text-slate-500">
            Your wishlist is empty. Tap the heart on any product to save it here.
          </p>
          <ButtonPrimary href="/">Browse products</ButtonPrimary>
        </div>
      );
    }

    const showSkeleton = (!ready || loading) && products.length === 0;
    if (showSkeleton) {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(ids.length || 3, 6) }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xl bg-neutral-200/60"
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.databaseId} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold">
          List of saved products
        </h2>
      </div>
      {renderBody()}
    </div>
  );
};

export default AccountSavelists;
