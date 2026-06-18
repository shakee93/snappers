// Use Client Directive
"use client";

// React and Next.js Imports
import React, { FC, useEffect, useState, ChangeEvent, FormEvent } from "react";

// GraphQL and Apollo Imports
import { useAddresses } from "@/hooks/useAddresses";
import { siteConfig } from "@/site.config";
import { useSession } from "@/context/SessionProvider";
import { toast } from "sonner";
import Checkbox from "@/shared/Checkbox/Checkbox";
import AccountSubmitButton from "@/components/account/AccountSubmitButton";
import {
  AccountInputField,
  AccountSelectField,
} from "@/components/account/AccountFormFields";
import { accountSubheadingClassName } from "@/components/account/accountStyles";

// Constants
const SRI_LANKAN_STATES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

type DeliveryFormProps = {
  onSaved?: () => void | Promise<void>;
  embedded?: boolean;
};

const DeliveryForm: FC<DeliveryFormProps> = ({ onSaved, embedded = false }) => {
  const { customer, fetchCustomer, updateCustomer } = useSession();
  const { getAddresses, data, error, updateAddress } = useAddresses();
  const [saveBothAddresses, setSaveBothAddresses] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    address1: "",
    address2: "",
    city: "",
    state: "Western",
    postcode: "",
    phone: "",
  });

  useEffect(() => {
    getAddresses();
  }, [getAddresses]);

  useEffect(() => {
    if (data?.customer?.shipping) {
      // console.log("Address: ", data);
      const { shipping } = data.customer;
      setFormData((prevData) => ({ ...prevData, ...shipping }));
    }
  }, [data]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateAddress({
        variables: {
          input: {
            shipping: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              address1: formData.address1,
              address2: formData.address2,
              city: formData.city,
              country: "LK",
              state: formData.state,
              postcode: formData.postcode,
              phone: formData.phone,
            },
            ...(saveBothAddresses && {
              billing: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address1: formData.address1,
                address2: formData.address2,
                city: formData.city,
                country: "LK",
                state: formData.state,
                postcode: formData.postcode,
                phone: formData.phone,
              },
            }),
          },
        },
      });
      await onSaved?.();
      toast.success("Shipping address updated successfully");
    } catch (error: any) {
      toast.error("Error updating shipping address:", error);
    }
  };

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className={embedded ? undefined : "nc-AddressPage"} data-nc-id="AccountPage">
      <div className={embedded ? undefined : "space-y-10 sm:space-y-12"}>
        {!embedded ? (
          <h2 className={accountSubheadingClassName}>Delivery Details</h2>
        ) : null}
        <form onSubmit={handleSubmit} className={embedded ? "space-y-2.5" : "gap-2"}>
          <div className={embedded ? undefined : "flex flex-col gap-2 md:flex-row"}>
            <div
              className={
                embedded
                  ? "space-y-2.5"
                  : "mt-10 max-w-3xl flex-grow space-y-6 md:mt-0"
              }
            >
              <div className={embedded ? "grid grid-cols-2 gap-2" : "flex gap-2"}>
                <AccountInputField
                  compact={embedded}
                  label="First Name"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <AccountInputField
                  compact={embedded}
                  label="Last Name"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              {embedded ? (
                <AccountInputField
                  compact={embedded}
                  label="Street Address"
                  name="address1"
                  placeholder="Street Address"
                  value={formData.address1}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex gap-2">
                  <AccountInputField
                  compact={embedded}
                    label="Street Address"
                    name="address1"
                    placeholder="Street Address"
                    value={formData.address1}
                    onChange={handleChange}
                  />
                  <AccountInputField
                  compact={embedded}
                    label="Apt, Suite, etc."
                    name="address2"
                    placeholder="Apt, Suite, etc."
                    value={formData.address2}
                    onChange={handleChange}
                  />
                </div>
              )}
              {embedded ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <AccountInputField
                      compact={embedded}
                      label="Apt, Suite, etc."
                      name="address2"
                      placeholder="Apt, Suite, etc."
                      value={formData.address2}
                      onChange={handleChange}
                    />
                    <AccountInputField
                      compact={embedded}
                      label="Town/City"
                      name="city"
                      placeholder="Town/City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <AccountSelectField
                    compact={embedded}
                    label="Country"
                    name="country"
                    value={formData.country}
                    options={[
                      {
                        value: siteConfig.locale.countryCode,
                        label: siteConfig.locale.countryName,
                      },
                    ]}
                    onChange={handleChange}
                    disabled={true}
                  />
                </>
              ) : (
                <div className="flex gap-2">
                  <AccountInputField
                  compact={embedded}
                    label="Town/City"
                    name="city"
                    placeholder="Town/City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <AccountSelectField
                  compact={embedded}
                    label="Country"
                    name="country"
                    value={formData.country}
                    options={[{ value: siteConfig.locale.countryCode, label: siteConfig.locale.countryName }]}
                    onChange={handleChange}
                    disabled={true}
                  />
                </div>
              )}
              <div className={embedded ? "grid grid-cols-2 gap-2" : "flex gap-2"}>
                <AccountInputField
                  compact={embedded}
                  label="Postcode/ZIP"
                  name="postcode"
                  placeholder="Postcode/ZIP"
                  value={formData.postcode}
                  onChange={handleChange}
                />
                <AccountSelectField
                  compact={embedded}
                  label="State"
                  name="state"
                  value={formData.state}
                  options={SRI_LANKAN_STATES.map((state) => ({
                    value: state,
                    label: state,
                  }))}
                  onChange={handleChange}
                />
              </div>
              <div>
                <AccountInputField
                  compact={embedded}
                  label="Phone"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <Checkbox
            defaultChecked={saveBothAddresses}
            className={embedded ? undefined : "mt-1.5"}
            name="save for both addresses"
            label="Include this in the Billing as well"
            onChange={() => setSaveBothAddresses(!saveBothAddresses)}
          />
          <AccountSubmitButton type="submit" className={embedded ? "w-full" : "mt-4"}>
            Save Delivery Address
          </AccountSubmitButton>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;
