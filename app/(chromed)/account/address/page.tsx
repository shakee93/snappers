"use client";
import React, { FC, useState } from "react";
import BillingForm from "@/components/global/forms/BillingForm";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import DeliveryForm from "@/components/global/forms/DeliveryForm";

const AddressSection: FC<{ title: string; onClick: () => void }> = ({
  title,
  onClick,
}) => (
  <div className="border p-6 rounded-3xl w-full">
    <h1 className="text-xl font-semibold">{title}</h1>
    <ButtonPrimary className="mt-4" onClick={onClick}>
      Add +
    </ButtonPrimary>
  </div>
);

const AddressPage: FC = () => {
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const toggleForm = (formType: string) => {
    setShowBillingForm(formType === "billing");
    setShowDeliveryForm(formType === "delivery");
  };

  return (
    <div className="nc-AddressPage" data-nc-id="AccountPage">
      <div className="space-y-10 sm:space-y-12">
        <h2 className="text-2xl sm:text-3xl font-semibold">Address</h2>
        <div className="flex gap-4 w-full">
          <AddressSection
            title="Delivery Address"
            onClick={() => toggleForm("delivery")}
          />
          <AddressSection
            title="Billing Address"
            onClick={() => toggleForm("billing")}
          />
        </div>
        {showDeliveryForm && <DeliveryForm />}
        {showBillingForm && <BillingForm />}
      </div>
    </div>
  );
};

export default AddressPage;
