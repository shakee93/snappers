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

const WelcomeMessages = [
  "Welcome back! We're delighted to see you again.",
  "Hello again! It's great to have you back with us.",
  "Welcome back to our Shop.",
  "You're back! We missed you. Welcome!",
  "We've been waiting for you! Welcome back!",
  "Welcome to GQ Mobiles once more.",
  "Welcome back, valued customer! Your presence brightens our day.",
  "Guess who's back? It's you! Welcome!",
  "It's a pleasure to have you back! Welcome to GQ Mobiles.",
];

const getRandomWelcomeMessage = () => {
  const randomIndex = Math.floor(Math.random() * WelcomeMessages.length);
  return WelcomeMessages[randomIndex];
};

//PAYMENT FUNCTIONS

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID;
const TEST: boolean = false;
const SANDBOX: boolean = false

const STATIC_DATA = {
  sandbox: SANDBOX,
  merchant_id: MERCHANT_ID,
  return_url: `${domain}/success`,
  cancel_url: `${domain}/cancel`,
  notify_url: `${domain}/notify`,
  order_id: "ItemNo12345",
  items: "gq mobiles",
  hash: null,
  amount: "100.00",
  currency: "LKR",
  first_name: "Saman",
  last_name: "Perera",
  email: "samanp@gmail.com",
  phone: "0771234567",
  address: "No.1, Galle Road",
  city: "Colombo",
  country: "Sri Lanka",
  delivery_address: "No. 46, Galle road, Kalutara South",
  delivery_city: "Kalutara",
  delivery_country: "Sri Lanka",
};

const TEST_STATIC_DATA = {
  sandbox: SANDBOX,
  merchant_id: MERCHANT_ID,
  return_url: `${domain}/success`,
  cancel_url: `${domain}/cancel`,
  notify_url: `${domain}/notify`,
  order_id: "ItemNo12345",
  items: "gq mobiles",
  hash: null,
  amount: "100.00",
  currency: "LKR",
  first_name: "shadeer",
  last_name: "sadikeen",
  email: "how@gmail.com",
  phone: "0771234567",
  address: "welllampitiya , colombodasf",
  city: "Colombo",
  country: "Sri Lanka",
  iframe: true
};



const getPaymentHash = async (dynamicData: any) => {

  try {
    const amount = TEST ? "100.00" : numberFormat(extractRawAmount(dynamicData?.amount), 2, ".", "");
    const order_id = TEST ? "ItemNo12345" : dynamicData?.order_id
    
    
    const requestData = {
      merchant_id: MERCHANT_ID,
      order_id:  order_id,
      amount: amount,
      currency: "LKR",
    };


    // console.log("data sent to the payhere hash: ", requestData);
    // console.log("requestData: ", requestData);
    // let oneHash = extractRawAmount(dynamicData?.amount);
    // console.log("oneHash", parseFloat(oneHash));

    const response = await fetch("/api/payhere", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // console.log("Response from the payment route: ",await response.json());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("after hash with external data: :", data);
    return data.hash;
  } catch (error) {
    console.error("Failed to fetch hash:", error);
  }
};

function numberFormat(amount: any, decimals: any, decimalPoint: any, thousandsSeparator: any) {
  // Format the number with the specified number of decimals
  let number = parseFloat(amount).toFixed(decimals);

  // Split the number into integer and decimal parts
  let parts = number.split('.');

  // Replace the thousands separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  // Reassemble the number and return it
  return parts.join(decimalPoint);
}

export {
  InputField,
  SelectField,
  SRI_LANKAN_STATES,
  extractRawAmount,
  LoggedInAvatar,
  transformAddress,
  savePaymentDetails,
  getRandomWelcomeMessage,
  STATIC_DATA,
  TEST_STATIC_DATA,
  getPaymentHash,
numberFormat
};

