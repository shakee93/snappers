const Bar = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/40 ${className}`} />
);

export const CheckoutFormSkeleton = () => {
  return (
    <div className="space-y-8" aria-label="Loading checkout details" aria-busy="true">
      <div className="flex items-center gap-3">
        <Bar className="h-2 w-16 rounded-full" />
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <Bar className="h-2 w-16 rounded-full" />
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <Bar className="h-2 w-16 rounded-full" />
      </div>

      <section className="space-y-3">
        <Bar className="h-5 w-44" />
        <Bar className="h-11 w-full rounded-xl" />
        <Bar className="h-11 w-full rounded-xl" />
      </section>

      <section className="space-y-3">
        <Bar className="h-5 w-32" />
        <Bar className="h-16 w-full rounded-xl" />
        <Bar className="h-16 w-full rounded-xl" />
      </section>

      <section className="space-y-3">
        <Bar className="h-11 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Bar className="h-11 rounded-xl" />
          <Bar className="h-11 rounded-xl" />
        </div>
      </section>

      <section className="space-y-3">
        <Bar className="h-5 w-36" />
        <Bar className="h-16 w-full rounded-xl" />
        <Bar className="h-16 w-full rounded-xl" />
      </section>

      <div className="flex items-center justify-between pt-2">
        <Bar className="h-4 w-24" />
        <Bar className="h-12 w-60 rounded-full" />
      </div>
    </div>
  );
};

export const OrderSummarySkeleton = ({ items = 2 }: { items?: number }) => {
  return (
    <div className="w-full" aria-label="Loading order summary" aria-busy="true">
      <Bar className="mb-3 h-3 w-40" />

      <div className="divide-y divide-slate-200/70 dark:divide-slate-700 pr-5">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex gap-4 py-4">
            <Bar className="h-20 w-20 rounded-lg shrink-0" />
            <div className="flex flex-1 min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Bar className="h-4 w-3/4" />
                <Bar className="h-3 w-1/3" />
                <Bar className="h-6 w-28 rounded-md" />
              </div>
              <div className="shrink-0 space-y-1.5 text-right">
                <Bar className="h-4 w-20 ml-auto" />
                <Bar className="h-3 w-16 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-200/70 dark:border-slate-700 pt-5 space-y-3">
        <Bar className="h-4 w-24" />
        <div className="flex gap-2">
          <Bar className="h-10 flex-1 rounded-full" />
          <Bar className="h-10 w-28 rounded-full" />
        </div>

        <div className="space-y-2 pt-3">
          <div className="flex justify-between">
            <Bar className="h-4 w-20" />
            <Bar className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Bar className="h-4 w-32" />
            <Bar className="h-4 w-20" />
          </div>
          <div className="flex items-baseline justify-between border-t border-slate-200/70 dark:border-slate-700 pt-3 mt-1">
            <Bar className="h-5 w-24" />
            <Bar className="h-6 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};
