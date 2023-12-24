"use client";
import React, {FC, useEffect, useState} from "react";
import {useMutation} from "@apollo/client";
import {UPDATE_CUSTOMER_MUTATION} from "@/graphql/defs/auth";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Select from "@/shared/Select/Select";
import Textarea from "@/shared/Textarea/Textarea";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {redirect} from "next/navigation";

const AccountPage: FC = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        dateOfBirth: "",
        address: "",
        gender: "",
        phoneNumber: "",
        about: "",
    });

    useEffect(() => {
        let authKey = localStorage.getItem("authToken");
        if (!authKey) {
            redirect('/login');
            return;
        }

        const storedData = {
            fullName: localStorage.getItem("displayName") || "",
            email: localStorage.getItem("email") || "",
            dateOfBirth: localStorage.getItem("dob") || "",
            address: localStorage.getItem("address") || "",
            gender: localStorage.getItem("gender") || "",
            phoneNumber: localStorage.getItem("phone_number") || "",
            about: localStorage.getItem("about") || "",
        };
        console.log(storedData);
        setFormData(storedData);
    }, []);

    const [UpdateCustomer] = useMutation(UPDATE_CUSTOMER_MUTATION);

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
        let id = localStorage.getItem("id");
        const response = await UpdateCustomer({
            variables: {
                input: {
                    id: id,
                    displayName: formData.fullName,
                    firstName: formData.fullName,
                    metaData: [
                        { key: "dob", value: formData.dateOfBirth },
                        { key: "address", value: formData.address },
                        { key: "gender", value: formData.gender },
                        { key: "phoneNumber", value: formData.phoneNumber },
                        { key: "about", value: formData.about },
                    ],
                },
            },
        });
        console.log("Updated Response: ", response);
        console.log("Form Data:", formData);
    };

    return (
        <div className={`nc-AccountPage `} data-nc-id="AccountPage">
            <div className="space-y-10 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl font-semibold">Account information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-grow mt-10 md:mt-0 max-w-3xl space-y-6">
                            <div>
                                <Label>Full name</Label>
                                <Input
                                    className="mt-1.5"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
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
                            </div>
                            <div className="max-w-lg">
                                <Label>Date of birth</Label>
                                <div className="mt-1.5 flex">
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
                            </div>
                            <div>
                                <Label>Address</Label>
                                <div className="mt-1.5 flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                    <i className="text-2xl las la-map-signs"></i>
                  </span>
                                    <Input
                                        className="!rounded-l-none"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
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
                            </div>
                            <div>
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
                            </div>
                            <div>
                                <Label>About you</Label>
                                <Textarea
                                    className="mt-1.5"
                                    name="about"
                                    value={formData.about}
                                    onChange={handleChange}
                                />
                            </div>
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
