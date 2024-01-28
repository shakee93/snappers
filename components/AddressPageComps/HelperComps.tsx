import Input from "@/shared/Input/Input";
import Select from "@/shared/Select/Select";
import Label from "../Label/Label";
import React from "react";
import { CheckoutPayload, CustomerAddressInput } from "@/graphql/types/graphql";
import { PaymentDetailsWithoutUrls } from "@/data/types";

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
// Smaller Components
const InputField = React.memo(function InputField({
  label,
  name,
  placeholder,
  value,
  onChange,
}: any) {
  return (
    <div className="flex-1">
      <Label>{label}</Label>
      <Input
        required={true}
        className="w-full"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
});

const SelectField = React.memo(function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
}: any) {
  return (
    <div className="flex-1">
      <Label>{label}</Label>
      <Select
        required={true}
        className="mt-1.5"
        value={value || ""}
        name={name}
        onChange={onChange}
        disabled={disabled}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
});

const extractRawAmount = (amountString: string) =>
  parseFloat(amountString.replace(/[^0-9.]/g, "")).toString();

const LoggedInAvatar = ({ name = "N" }) => {
  const initial = name.charAt(0).toUpperCase() || "N";

  return (
    <div className="rounded-full border-4 flex items-center bg-blue-700 justify-center border-blue-700 h-8 w-8">
      <p className="font-bold text-white">{initial}</p>
    </div>
  );
};

const transformAddress = (originalAddress: any): CustomerAddressInput => {
  return {
    address1: originalAddress.address,
    address2: originalAddress.apartment,
    city: originalAddress.city,
    country: originalAddress.country,
    firstName: originalAddress.firstName,
    lastName: originalAddress.lastName,
    state: originalAddress.state,
    postcode: originalAddress.postal,
  };
};

const savePaymentDetails = (
  checkoutDetails: any
): PaymentDetailsWithoutUrls => {
  let orderDetails: CheckoutPayload = checkoutDetails?.checkout;
  let { order, customer } = orderDetails;

  let saved_data = {
    amount: order?.total ?? "no_amount",
    items: "Mobile Items",
    order_id: order?.databaseId?.toString() ?? "no_order_id_found",
    first_name: customer?.billing?.firstName || "no_lastname",
    last_name: customer?.billing?.lastName || "no firstname",
    email: customer?.email || "no_email",
    address: customer?.billing?.address1 || "no_address",
  };

  return saved_data;
};

export {
  InputField,
  SelectField,
  SRI_LANKAN_STATES,
  extractRawAmount,
  LoggedInAvatar,
  transformAddress,
  savePaymentDetails
};
