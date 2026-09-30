"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Loader } from "lucide-react";
import type { MyOrder } from "@/graphql/defs/order";

interface CancelOrderConfirmDialogProps {
  order: MyOrder | null;
  show: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CancelOrderConfirmDialog = ({
  order,
  show,
  loading,
  onCancel,
  onConfirm,
}: CancelOrderConfirmDialogProps) => {
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[1200]"
        onClose={loading ? () => {} : onCancel}
      >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white text-left shadow-xl">
              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <Dialog.Title className="text-base font-bold text-neutral-900 sm:text-lg">
                  Cancel order{order?.orderNumber ? ` #${order.orderNumber}` : ""}?
                </Dialog.Title>
                <p className="mt-2 text-sm text-neutral-600">
                  This can&rsquo;t be undone. Once cancelled, the order will need
                  to be placed again.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E8E8E8] bg-neutral-50 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Keep order
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  {loading ? "Cancelling…" : "Cancel order"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CancelOrderConfirmDialog;
