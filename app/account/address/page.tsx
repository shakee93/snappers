"use client";
import React, { FC, useState } from "react";
import BillingForm from "@/components/AddressPageComps/BillingForm";
import ShippingForm from "@/components/AddressPageComps/ShippingForm";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

const AddressSection: FC<{ title: string; onClick: () => void }> = ({ title, onClick }) => (
    <div className="border p-6 rounded-3xl w-full">
        <h1 className="text-xl font-semibold">{title}</h1>
        <ButtonPrimary className="mt-4" onClick={onClick}>
            Add / Edit
        </ButtonPrimary>
    </div>
);

const AddressPage: FC = () => {
    const [showBillingForm, setShowBillingForm] = useState(false);
    const [showShippingForm, setShowShippingForm] = useState(false);

    const toggleForm = (formType: string) => {
        setShowBillingForm(formType === "billing");
        setShowShippingForm(formType === "shipping");
    };

    return (
        <div className="nc-AddressPage" data-nc-id="AccountPage">
            <div className="space-y-10 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl font-semibold">Address</h2>
                <div className="flex gap-4 w-full">
                    <AddressSection title="Shipping Address" onClick={() => toggleForm("shipping")} />
                    <AddressSection title="Billing Address" onClick={() => toggleForm("billing")} />
                </div>
                {/* {showShippingForm && <ShippingForm />} */}
            <ShippingForm/>


                {showBillingForm && <BillingForm />}
            </div>
        </div>
    );
};

export default AddressPage;
