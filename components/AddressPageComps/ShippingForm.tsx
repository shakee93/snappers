// Use Client Directive
"use client";

// React and Next.js Imports
import React, { FC, useEffect, useState, ChangeEvent, FormEvent } from "react";

// GraphQL and Apollo Imports
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_ADDRESSES, UPDATE_ADDRESS } from "@/graphql/defs/order";

// Component Imports
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Select from "@/shared/Select/Select";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

// Context and Utility Imports
import { useSession } from "@/context/SessionProvider";
import toast from "react-hot-toast";

// Types and Interfaces
import { Customer } from "@/graphql/types/graphql";
import { InputField, SelectField } from "./HelperComps";

// Constants
const SRI_LANKAN_STATES = [
    "Western", "Central", "Southern", "Northern", "Eastern",
    "North Western", "North Central", "Uva", "Sabaragamuwa",
];

const ShippingForm: FC = () => {
    const { customer, fetchCustomer, updateCustomer } = useSession();
    const [getAddresses, { loading, data, error }] = useLazyQuery(GET_ADDRESSES, {
        fetchPolicy: 'no-cache'
    });
    const [updateBillingAddress] = useMutation(UPDATE_ADDRESS);
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", country: "",
        address1: "", address2: "", townCity: "",
        state: "", postcodeZip: "", phone: ""
    });

    useEffect(() => {
        getAddresses();
    }, []);

    useEffect(() => {
        if (data?.customer?.shipping) {
            const { shipping } = data.customer;
            setFormData(prevData => ({ ...prevData, ...shipping }));
        }
    }, [data]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const { data } = await updateBillingAddress({
                variables: {
                    input: {
                        shipping: {
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            address1: formData.address1,
                            address2: formData.address2,
                            city: formData.townCity,
                            country: "LK",
                            state: formData.state,
                            postcode: formData.postcodeZip,
                            phone: formData.phone,
                        }
                    },
                },
            });

            // Handle success or show a success message
            toast.success("Shipping address updated successfully");
        } catch (error: any) {
            // Handle error or show an error message
            toast.error("Error updating billing address:", error);
        }
    };

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div className="nc-AddressPage" data-nc-id="AccountPage">
            <div className="space-y-10 sm:space-y-12">
                <h2 className="text-xl sm:text-2xl font-semibold">Shipping Details</h2>
                <form onSubmit={handleSubmit} className="gap-2">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <div className="flex-grow mt-10 md:mt-0 max-w-3xl space-y-6">
                            <div className="flex gap-2">
                                <InputField label="First Name" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
                                <InputField label="Last Name" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2">
                                <InputField label="Street Address" name="address2" placeholder="Street Address" value={formData.address2} onChange={handleChange} />
                                <InputField  label="Apt, Suite, etc." name="address1" placeholder="Apt, Suite, etc." value={formData.address1} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2">
                                <InputField label="Town/City" name="townCity" placeholder="Town/City" value={formData.townCity} onChange={handleChange} />
                                <SelectField label="Country" name="country" value={formData.country} options={[{value: "LK", label: "Sri Lanka"}]} onChange={handleChange} disabled={true} />
                            </div>
                            <div className="flex gap-2">
                                <InputField label="Postcode/ZIP" name="postcodeZip" placeholder="Postcode/ZIP" value={formData.postcodeZip} onChange={handleChange} />
                                <SelectField label="State" name="state" value={formData.state} options={SRI_LANKAN_STATES.map(state => ({ value: state, label: state }))} onChange={handleChange} />
                            </div>
                            <div>
                                <InputField label="Phone" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <ButtonPrimary type="submit" className="mt-4">Save Shipping Address</ButtonPrimary>
                </form>
            </div>
        </div>
    );
    
};

export default ShippingForm;
