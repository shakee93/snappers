"use client";

import React, { FC, useState, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_ADDRESS } from "@/graphql/defs/order";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useSession } from "@/context/SessionProvider";
import toast from "react-hot-toast";
import { InputField } from "./HelperComps";



const BillingForm: FC = () => {
    const { customer, fetchCustomer, updateCustomer } = useSession();

    const [updateShipping] = useMutation(UPDATE_ADDRESS);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        country: "",
        address1: "",
        address2: "",
        townCity: "",
        state: "",
        postcodeZip: "",
        billingPhone: "",
        billingEmail: "",
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData(prevData => ({
                ...prevData,
                [name]: value,
            }));
        },
        []
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await updateShipping({
                variables: {
                    input: {
                        shipping: { ...formData }
                    },
                },
            });
            toast.success("Billing address updated successfully");
        } catch (error: any) {
            toast.error(`Error updating billing address: ${error.message}`);
        }
    };

    return (
        <div className="nc-AddressPage" data-nc-id="AccountPage">
            <div className="space-y-10 sm:space-y-12">
                <h2 className="text-xl sm:text-2xl font-semibold">Billing Details</h2>
                <form onSubmit={handleSubmit} className="gap-2">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <div className="flex-grow mt-10 md:mt-0 max-w-3xl space-y-6">
                            <div className="flex gap-2">
                                <InputField label="First Name" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
                                <InputField label="Last Name" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2">
                                <InputField label="Street Address" name="address1" placeholder="Street Address" value={formData.address1} onChange={handleChange} />
                                <InputField label="Apt, Suite, etc." name="address2" placeholder="Apt, Suite, etc." value={formData.address2} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2">
                                <InputField label="Town/City" name="townCity" placeholder="Town/City" value={formData.townCity} onChange={handleChange} />
                                <InputField label="Country" name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2">
                                <InputField label="Postcode/ZIP" name="postcodeZip" placeholder="Postcode/ZIP" value={formData.postcodeZip} onChange={handleChange} />
                                <InputField label="State" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                            </div>
                            <div>
                                <InputField label="Phone" name="billingPhone" placeholder="Phone" value={formData.billingPhone} onChange={handleChange} />
                            </div>
                            <div>
                                <InputField label="Email" name="billingEmail" placeholder="Email" value={formData.billingEmail} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <ButtonPrimary type="submit" className="mt-4">Save Billing Address</ButtonPrimary>
                </form>
            </div>
        </div>
    );
};

export default BillingForm;
