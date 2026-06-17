"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";
import BillingForm from "@/components/global/forms/BillingForm";
import DeliveryForm from "@/components/global/forms/DeliveryForm";

export type AddressFormType = "delivery" | "billing";

interface AccountAddressFormModalProps {
  formType: AddressFormType | null;
  show: boolean;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

const titles: Record<AddressFormType, string> = {
  delivery: "Delivery address",
  billing: "Billing address",
};

const AccountAddressFormModal = ({
  formType,
  show,
  onClose,
  onSaved,
}: AccountAddressFormModalProps) => {
  const handleSaved = async () => {
    await onSaved();
    onClose();
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <div className="flex min-h-full items-center justify-center p-4">
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
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-left shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E8E8E8] px-5 py-4 sm:px-6">
                <Dialog.Title className="text-lg font-bold text-header-green">
                  {formType ? titles[formType] : ""}
                </Dialog.Title>
                <ButtonClose onClick={onClose} />
              </div>

              <div className="hiddenScrollbar flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
                {formType === "delivery" ? (
                  <DeliveryForm embedded onSaved={handleSaved} />
                ) : null}
                {formType === "billing" ? (
                  <BillingForm embedded onSaved={handleSaved} />
                ) : null}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AccountAddressFormModal;
