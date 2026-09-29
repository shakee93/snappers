"use client";

import { Loader, X } from "lucide-react";

interface CancelOrderButtonProps {
  loading?: boolean;
  disabled?: boolean;
  size?: "compact" | "default";
  onClick: () => void;
}

const CancelOrderButton = ({
  loading = false,
  disabled = false,
  size = "default",
  onClick,
}: CancelOrderButtonProps) => {
  const isCompact = size === "compact";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      disabled={disabled || loading}
      aria-label="Cancel order"
      className={
        isCompact
          ? "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {loading ? (
        <Loader
          className={isCompact ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4 animate-spin"}
          aria-hidden
        />
      ) : (
        <X
          className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}
          aria-hidden
        />
      )}
      {loading ? "Cancelling…" : isCompact ? "Cancel" : "Cancel order"}
    </button>
  );
};

export default CancelOrderButton;
