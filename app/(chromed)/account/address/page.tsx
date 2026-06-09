"use client";
import React, { FC, useEffect, useState } from "react";
import BillingForm from "@/components/global/forms/BillingForm";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import DeliveryForm from "@/components/global/forms/DeliveryForm";
import { useAddresses } from "@/hooks/useAddresses";
import {
  CustomerAddressLike,
  formatCustomerAddress,
  hasSavedAddress,
} from "@/lib/formatCustomerAddress";

const AddressSection: FC<{
  title: string;
  address?: CustomerAddressLike | null;
  loading?: boolean;
  onEdit: () => void;
}> = ({ title, address, loading, onEdit }) => {
  const saved = hasSavedAddress(address);

  return (
    <div className="border p-6 rounded-3xl w-full">
      <h1 className="text-xl font-semibold">{title}</h1>
      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">Loading address…</p>
      ) : saved && address ? (
        <p className="mt-4 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
          {formatCustomerAddress(address)}
        </p>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">No address saved yet.</p>
      )}
      <ButtonPrimary className="mt-4" onClick={onEdit}>
        {saved ? "Edit" : "Add +"}
      </ButtonPrimary>
    </div>
  );
};

const AddressPage: FC = () => {
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const { getAddresses, loading, data, error } = useAddresses();

  useEffect(() => {
    getAddresses();
  }, [getAddresses]);

  const refreshAddresses = async () => {
    await getAddresses();
  };

  const toggleForm = (formType: "billing" | "delivery") => {
    setShowBillingForm(formType === "billing");
    setShowDeliveryForm(formType === "delivery");
  };

  const shipping = data?.customer?.shipping;
  const billing = data?.customer?.billing;

  return (
    <div className="nc-AddressPage" data-nc-id="AccountPage">
      <div className="space-y-10 sm:space-y-12">
        <h2 className="text-2xl sm:text-3xl font-semibold">Address</h2>
        {error ? (
          <p className="text-sm text-red-600">
            Could not load your addresses. Please try again.
          </p>
        ) : null}
        <div className="flex flex-col gap-4 w-full lg:flex-row">
          <AddressSection
            title="Delivery Address"
            address={shipping}
            loading={loading && !data}
            onEdit={() => toggleForm("delivery")}
          />
          <AddressSection
            title="Billing Address"
            address={billing}
            loading={loading && !data}
            onEdit={() => toggleForm("billing")}
          />
        </div>
        {showDeliveryForm && (
          <DeliveryForm onSaved={refreshAddresses} />
        )}
        {showBillingForm && <BillingForm onSaved={refreshAddresses} />}
      </div>
    </div>
  );
};

export default AddressPage;
