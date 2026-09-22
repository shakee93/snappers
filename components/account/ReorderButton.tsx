"use client";

import { Loader, RotateCw } from "lucide-react";

interface ReorderButtonProps {
  loading?: boolean;
  disabled?: boolean;
  size?: "compact" | "default";
  onClick: () => void;
}

const ReorderButton = ({
  loading = false,
  disabled = false,
  size = "default",
  onClick,
}: ReorderButtonProps) => {
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
      aria-label="Reorder items"
      className={
        isCompact
          ? "inline-flex items-center gap-1.5 rounded-full bg-header-action px-3 py-1.5 text-xs font-bold text-header-green transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex items-center justify-center gap-2 rounded-full bg-header-action px-5 py-2.5 text-sm font-bold text-header-green shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {loading ? (
        <Loader
          className={isCompact ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4 animate-spin"}
          aria-hidden
        />
      ) : (
        <RotateCw
          className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}
          aria-hidden
        />
      )}
      {loading ? "Adding…" : "Reorder"}
    </button>
  );
};

export default ReorderButton;
