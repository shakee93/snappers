"use client";

import { FC, useEffect, useState } from "react";
import AccountSubmitButton from "@/components/account/AccountSubmitButton";
import AccountAddressFormModal, {
  AddressFormType,
} from "@/components/account/AccountAddressFormModal";
import { useAddresses } from "@/hooks/useAddresses";
import {
  CustomerAddressLike,
  formatCustomerAddress,
  hasSavedAddress,
} from "@/lib/formatCustomerAddress";
import {
  accountCardClassName,
  accountPageTitleClassName,
} from "@/components/account/accountStyles";

const AddressSection: FC<{
  title: string;
  address?: CustomerAddressLike | null;
  loading?: boolean;
  onEdit: () => void;
}> = ({ title, address, loading, onEdit }) => {
  const saved = hasSavedAddress(address);

  return (
    <div className={accountCardClassName}>
      <h3 className="text-xl font-semibold text-header-green">{title}</h3>
      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">Loading address…</p>
      ) : saved && address ? (
        <p className="mt-4 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
          {formatCustomerAddress(address)}
        </p>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">No address saved yet.</p>
      )}
      <AccountSubmitButton className="mt-4 w-full" onClick={onEdit}>
        {saved ? "Edit" : "Add +"}
      </AccountSubmitButton>
    </div>
  );
};

const AccountAddressPanel = () => {
  const [activeForm, setActiveForm] = useState<AddressFormType | null>(null);
  const { getAddresses, loading, data, error } = useAddresses();

  useEffect(() => {
    getAddresses();
  }, [getAddresses]);

  const refreshAddresses = async () => {
    await getAddresses();
  };

  const shipping = data?.customer?.shipping;
  const billing = data?.customer?.billing;

  return (
    <div className="nc-AddressPage" data-nc-id="AccountPage">
      <div className="space-y-10 sm:space-y-12">
        <h2 className={accountPageTitleClassName}>Address</h2>
        {error ? (
          <p className="text-sm text-red-600">
            Could not load your addresses. Please try again.
          </p>
        ) : null}
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <AddressSection
            title="Delivery Address"
            address={shipping}
            loading={loading && !data}
            onEdit={() => setActiveForm("delivery")}
          />
          <AddressSection
            title="Billing Address"
            address={billing}
            loading={loading && !data}
            onEdit={() => setActiveForm("billing")}
          />
        </div>
      </div>

      <AccountAddressFormModal
        formType={activeForm}
        show={activeForm !== null}
        onClose={() => setActiveForm(null)}
        onSaved={refreshAddresses}
      />
    </div>
  );
};

export default AccountAddressPanel;
