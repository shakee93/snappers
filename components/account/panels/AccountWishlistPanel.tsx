"use client";

import { useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { useSession } from "@/context/SessionProvider";
import { useWishlist } from "@/context/WishlistProvider";
import { GET_WISHLIST_PRODUCTS } from "@/graphql/defs/products";
import ProductCard, { ProductCardItem } from "@/components/home/ProductCard";
import ProductCardLoading from "@/components/global/primitives/Loading/ProductCardLoading";
import AccountSubmitButton from "@/components/account/AccountSubmitButton";
import { accountPageTitleClassName } from "@/components/account/accountStyles";

const AccountWishlistPanel = () => {
  const { customer } = useSession();
  const { ids, ready } = useWishlist();
  const isLoggedIn = !!customer && customer.id !== "guest";

  const [fetchProducts, { data, loading }] = useLazyQuery(GET_WISHLIST_PRODUCTS, {
    fetchPolicy: "no-cache",
  });

  const idsKey = ids.join(",");
  useEffect(() => {
    if (!isLoggedIn || ids.length === 0) return;
    fetchProducts({ variables: { ids } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, isLoggedIn]);

  const products = useMemo(() => {
    const nodes: ProductCardItem[] = data?.products?.nodes ?? [];
    const order = new Map(ids.map((id, index) => [id, index]));
    return nodes
      .filter((node) => order.has(node.databaseId ?? -1))
      .sort(
        (a, b) =>
          (order.get(a.databaseId ?? -1) ?? Infinity) -
          (order.get(b.databaseId ?? -1) ?? Infinity)
      );
  }, [data, ids]);

  const renderBody = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="text-slate-500">
            Please log in to view your saved products.
          </p>
          <AccountSubmitButton href="/login">Log in</AccountSubmitButton>
        </div>
      );
    }

    const skeleton = (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: Math.min(ids.length || 3, 6) }).map((_, i) => (
          <ProductCardLoading key={i} />
        ))}
      </div>
    );

    if (!ready) return skeleton;

    if (ids.length === 0) {
      return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="text-slate-500">
            Your wishlist is empty. Tap the heart on any product to save it here.
          </p>
          <AccountSubmitButton href="/">Browse products</AccountSubmitButton>
        </div>
      );
    }

    if (products.length === 0 && (loading || !data)) return skeleton;

    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="text-slate-500">
            None of your saved products are available right now.
          </p>
          <AccountSubmitButton href="/">Browse products</AccountSubmitButton>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.databaseId} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      <h2 className={accountPageTitleClassName}>List of saved products</h2>
      {renderBody()}
    </div>
  );
};

export default AccountWishlistPanel;
