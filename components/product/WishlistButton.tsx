"use client";

import { useMemo, useState } from "react";
import { Heart, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useSession } from "@/context/SessionProvider";
import { useWishlist } from "@/context/WishlistProvider";

interface WishlistButtonProps {
  productId?: number | null;
  className?: string;
  /** Heart icon size in px. */
  size?: number;
  /** Show “Add to wishlist” label beside the icon (PDP secondary row). */
  showLabel?: boolean;
}

/**
 * Heart toggle backed by the YITH wishlist. Membership is an O(1) Set lookup in
 * WishlistProvider, so this stays cheap when rendered across product grids.
 * Logged-out users are sent to /login on click.
 */
const WishlistButton = ({
  productId,
  className = "",
  size = 20,
  showLabel = false,
}: WishlistButtonProps) => {
  const { customer } = useSession();
  const { isInWishlist, toggle } = useWishlist();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const isLoggedIn = !!customer && customer.id !== "guest";
  const active = useMemo(
    () => (productId ? isInWishlist(productId) : false),
    [productId, isInWishlist],
  );

  const handleClick = async (event: React.MouseEvent) => {
    // Cards wrap the image in a Link — don't navigate when toggling.
    event.preventDefault();
    event.stopPropagation();

    if (!productId) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setBusy(true);
    try {
      await toggle(productId);
    } catch {
      // Provider already surfaced a toast and rolled back.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || !productId}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={twMerge(
        "flex items-center justify-center transition-colors disabled:cursor-not-allowed",
        className,
      )}
    >
      {busy ? (
        <Loader
          className="animate-spin text-[#374151]"
          style={{ width: size, height: size }}
        />
      ) : (
        <>
          <Heart
            style={{ width: size, height: size }}
            className={twMerge(
              "shrink-0 transition-colors",
              active ? "fill-red-500 text-red-500" : "text-[#374151]",
            )}
          />
          {showLabel && (
            <span className="truncate">
              {active ? "In wishlist" : "Add to wishlist"}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default WishlistButton;
