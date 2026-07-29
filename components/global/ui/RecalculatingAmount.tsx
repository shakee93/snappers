/**
 * Placeholder for a money figure while WooCommerce re-quotes the cart.
 */
export const RecalculatingAmount = ({
  className = "h-5 w-20",
}: {
  className?: string;
}) => (
  <span
    className={`inline-block animate-pulse rounded bg-slate-200 align-middle dark:bg-slate-700 ${className}`}
  />
);
