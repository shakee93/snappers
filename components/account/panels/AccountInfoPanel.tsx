"use client";

import { FC, useEffect, useState } from "react";
import AccountInput from "@/components/account/AccountInput";
import Label from "@/components/global/primitives/Label/Label";
import AccountSelect from "@/components/account/AccountSelect";
import AccountSubmitButton from "@/components/account/AccountSubmitButton";
import { useSession } from "@/context/SessionProvider";
import { toast } from "sonner";
import {
  accountFormClassName,
  accountLabelClassName,
  accountPageTitleClassName,
} from "@/components/account/accountStyles";

const AccountInfoPanel: FC = () => {
  const { customer, fetchCustomer, updateCustomer } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    dateOfBirth: "",
    address: "",
    gender: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        displayName: customer.displayName || "",
        email: customer.email || "",
        dateOfBirth:
          customer.metaData?.find((md) => md?.key === "dob")?.value || "",
        address: customer.shipping?.address1 || "",
        gender:
          customer.metaData?.find((md) => md?.key === "gender")?.value || "",
        phoneNumber: customer.shipping?.phone || "",
      });
    }
  }, [customer]);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { displayName, email, dateOfBirth, address, gender, phoneNumber } =
      formData;

    const input = {
      shipping: { address1: address, phone: phoneNumber },
      email: email,
      displayName: displayName,
      metaData: [
        { key: "dob", value: dateOfBirth },
        { key: "gender", value: gender },
      ],
    };

    try {
      await updateCustomer(input);
      toast.success("Account details updated successfully");
    } catch {
      toast.error("Something Went Wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nc-AccountPage" data-nc-id="AccountPage">
      <div className="space-y-8 sm:space-y-10">
        <h2 className={accountPageTitleClassName}>Account information</h2>
        <form onSubmit={handleSubmit} className={accountFormClassName}>
          <div>
            <Label className={accountLabelClassName}>Display Name</Label>
            <AccountInput
              required
              name="displayName"
              placeholder="Your name"
              value={formData.displayName}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label className={accountLabelClassName}>Email</Label>
            <AccountInput
              required
              name="email"
              type="email"
              disabled
              placeholder="example@email.com"
              value={formData.email}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className={accountLabelClassName}>Date of birth</Label>
              <AccountInput
                required
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className={accountLabelClassName}>Gender</Label>
              <AccountSelect
                required
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </AccountSelect>
            </div>
          </div>

          <div>
            <Label className={accountLabelClassName}>Phone number</Label>
            <AccountInput
              required
              name="phoneNumber"
              type="tel"
              placeholder="07X XXX XXXX"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="pt-1">
            <AccountSubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update account"}
            </AccountSubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountInfoPanel;
