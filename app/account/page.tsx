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



const AccountPage: FC = () => {
    const { customer, fetchCustomer, updateCustomer } = useSession();

    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        dateOfBirth: "",
        address: "",
        gender: "",
        phoneNumber: "",
        about: "",
    });

    useEffect(() => {
        if (customer) {
            // console.log("Customer details:", customer);
            const newFormData: any = {
                id: customer.id || "",
                displayName: customer.displayName || "",
                email: customer.email || "",
                dateOfBirth: customer.metaData?.find((md) => md?.key === "dob")?.value,
                address: customer.shipping?.address1,
                gender: customer.metaData?.find((md) => md?.key === "gender")?.value || "",
                phoneNumber: customer.shipping?.phone,
                about: customer.metaData?.find((md) => md?.key === "about")?.value || "",
            };
            setFormData(newFormData);
        }
    }, [customer]);

    useEffect(() => {
        fetchCustomer();
    }, []);

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
        const { displayName, email, dateOfBirth, address, gender, phoneNumber, about } = formData;

        const input = {
            shipping: { address1: address, phone: phoneNumber },
            email: email,
            displayName: displayName,
            metaData: [
                { key: "dob", value: dateOfBirth },
                { key: "gender", value: gender },
                { key: "about", value: about },
            ],
        };

        const response = await updateCustomer(input);
        toast.success("Account details updated successfully");
    };

    return (
        <div className="nc-AccountPage" data-nc-id="AccountPage">
            <div className="space-y-10 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl font-semibold">Account information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-grow mt-10 md:mt-0 max-w-3xl space-y-6">
                            <Label>Full name</Label>
                            <Input
                                className="mt-1.5"
                                name="displayName"
                                placeholder="Your name"
                                value={formData.displayName}
                                onChange={handleChange}
                            />
                            <Label>Email</Label>
                            <div className="mt-1.5 flex">
                                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    <i className="text-2xl las la-envelope"></i>
                                </span>
                                <Input
                                    className="!rounded-l-none"
                                    name="email"
                                    disabled={true}
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <Label>Date of birth</Label>
                            <div className="my-2 flex">
                                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    <i className="text-2xl las la-calendar"></i>
                                </span>
                                <Input
                                    className="!rounded-l-none"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>
                            {/* <Label>Address</Label> */}
                            {/* <div className="mt-1.5 flex">
                                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    <i className="text-2xl las la-map-signs"></i>
                                </span>
                                <ButtonPrimary>
                                    Add Billing Address
                                </ButtonPrimary>
                                {/* <Input
                                    className="!rounded-l-none"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                /> */}
                            {/* </div> */} 
                            <Label>Gender</Label>
                            <Select
                                className="mt-1.5"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Select>
                            <Label>Phone number</Label>
                            <div className="mt-1.5 flex">
                                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    <i className="text-2xl las la-phone-volume"></i>
                                </span>
                                <Input
                                    className="!rounded-l-none"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            <Label>About you</Label>
                            <Textarea
                                className="mt-1.5"
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                            />
                            <div className="pt-2">
                                <ButtonPrimary type="submit">Update account</ButtonPrimary>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountPage;
