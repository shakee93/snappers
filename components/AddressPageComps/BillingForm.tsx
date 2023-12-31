"use client";

import React, { FC, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_ACCOUNT_INFORMATION } from "@/graphql/defs/auth";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Select from "@/shared/Select/Select";
import Textarea from "@/shared/Textarea/Textarea";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useSession } from "@/context/SessionProvider";
import toast from "react-hot-toast";



const BillingForm: FC = () => {

    const { customer, fetchCustomer, updateCustomer } = useSession();

    const [formData, setFormData] = useState({
        country: "",
        streetAddress: "",
        townCity: "",
        postcodeZip: "",
        billingPhone: "",
        billingEmail: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // const { displayName, email, dateOfBirth, address, gender, phoneNumber, about } = formData;

        // const input = {
        //     shipping: { address1: address, phone: phoneNumber },
        //     email: email,
        //     displayName: displayName,
        //     metaData: [
        //         { key: "dob", value: dateOfBirth },
        //         { key: "gender", value: gender },
        //         { key: "about", value: about },
        //     ],
        // };

        // const response = await updateCustomer(input);
        toast.success("Account details updated successfully");
    };

    return (
        <div className="nc-AddressPage" data-nc-id="AccountPage">
            <div className="space-y-10 sm:space-y-12">
                <h2 className="text-xl sm:text-2xl font-semibold">Billing Details</h2>
                <form onSubmit={handleSubmit} className="gap-2">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <div className="flex-grow mt-10 md:mt-0 max-w-3xl space-y-6">
                            <div>
                                <Label>Country</Label>
                                <Input
                                    className=""
                                    name="country"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label>Street Address</Label>
                                <Input
                                    className=""
                                    name="streetAddress"
                                    placeholder="Street Address"
                                    value={formData.streetAddress}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label>Town/City</Label>
                                <Input
                                    className=""
                                    name="townCity"
                                    placeholder="Town/City"
                                    value={formData.townCity}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label>Postcode/ZIP</Label>
                                <Input
                                    className=""
                                    name="postcodeZip"
                                    placeholder="Postcode/ZIP"
                                    value={formData.postcodeZip}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label className="pt-2">Phone</Label>
                                <Input
                                    className="mt-0"
                                    name="billingPhone"
                                    placeholder="Phone"
                                    value={formData.billingPhone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    className=""
                                    name="billingEmail"
                                    placeholder="Email"
                                    value={formData.billingEmail}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                    </div>
                    <ButtonPrimary type="submit"  className="mt-4">
                        Save Billing Address
                    </ButtonPrimary>
                </form>
            </div>
        </div>
    );
};

export default BillingForm;
