// Use Client Directive
"use client";

// React and Next.js Imports
import React, { FC, useEffect, useState, ChangeEvent, FormEvent } from "react";

// GraphQL and Apollo Imports
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_ADDRESSES, UPDATE_ADDRESS } from "@/graphql/defs/order";
import { siteConfig } from "@/site.config";

// Component Imports
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Select from "@/shared/Select/Select";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

// Context and Utility Imports
import { useSession } from "@/context/SessionProvider";
import { toast } from "sonner";

// Types and Interfaces
import { Customer } from "@/graphql/types/graphql";
import { InputField, SRI_LANKAN_STATES, SelectField } from "./HelperComps";
import Checkbox from "@/shared/Checkbox/Checkbox";

// Constants


const BillingForm: FC = () => {
  const { customer, fetchCustomer, updateCustomer } = useSession();
  const [getAddresses, { loading, data, error }] = useLazyQuery(GET_ADDRESSES, {
    fetchPolicy: "no-cache",
  });
  const [saveBothAddresses, setSaveBothAddresses] = useState(false);

  const [updateBilling] = useMutation(UPDATE_ADDRESS);
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
    if (data?.customer?.billing) {
      const { billing } = data.customer;
      setFormData((prevData) => ({ ...prevData, ...billing }));
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
      let updatingValues = {
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
        ...(saveBothAddresses && {
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
        }),
      };
      await updateBilling({
        variables: {
          input: updatingValues,
        },
      });

      toast.success("Shipping address updated successfully");
    } catch (error: any) {
      toast.error("Error updating shipping address:", error);
    }
  };

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="nc-AddressPage" data-nc-id="AccountPage">
      <div className="space-y-10 sm:space-y-12">
        <h2 className="text-xl sm:text-2xl font-semibold">Billing Details</h2>
        <form onSubmit={handleSubmit} className="gap-2">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex-grow mt-10 md:mt-0 max-w-3xl space-y-6">
              <div className="flex gap-2">
                <InputField
                  label="First Name"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <InputField
                  label="Last Name"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2">
                <InputField
                  label="Street Address"
                  name="address2"
                  placeholder="Street Address"
                  value={formData.address1}
                  onChange={handleChange}
                />
                <InputField
                  label="Apt, Suite, etc."
                  name="address1"
                  placeholder="Apt, Suite, etc."
                  value={formData.address2}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2">
                <InputField
                  label="Town/City"
                  name="city"
                  placeholder="Town/City"
                  value={formData.city}
                  onChange={handleChange}
                />
                <SelectField
                  label="Country"
                  name="country"
                  value={formData.country}
                  options={[{ value: siteConfig.locale.countryCode, label: siteConfig.locale.countryName }]}
                  onChange={handleChange}
                  disabled={true}
                />
              </div>
              <div className="flex gap-2">
                <InputField
                  label="Postcode/ZIP"
                  name="postcode"
                  placeholder="Postcode/ZIP"
                  value={formData.postcode}
                  onChange={handleChange}
                />
                <SelectField
                  label="State"
                  name="state"
                  defaultValue={SRI_LANKAN_STATES[0]}
                  value={formData.state}
                  options={SRI_LANKAN_STATES.map((state) => ({
                    value: state,
                    label: state,
                  }))}
                  onChange={handleChange}
                />
              </div>
              <div>
                <InputField
                  label="Phone"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <Checkbox
                defaultChecked={saveBothAddresses}
                name="save for both addresses"
                label="Include this in the delivery as well"
                onChange={() => setSaveBothAddresses(!saveBothAddresses)}
              />
            </div>
          </div>
          <ButtonPrimary type="submit" className="mt-4">
            Save Billing Address
          </ButtonPrimary>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;
