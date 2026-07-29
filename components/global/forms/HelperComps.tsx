import Input from "@/shared/Input/Input";
import Select from "@/shared/Select/Select";
import Label from "@/components/global/primitives/Label/Label";
import React from "react";
import { CheckoutPayload, CustomerAddressInput } from "@/graphql/types/graphql";
import { PaymentDetailsWithoutUrls } from "@/data/types";
import { siteConfig } from "@/site.config";
import { apiUrl } from "@/lib/api";
import WelcomeMessages from "@/content/welcome-messages.json";
import { SRI_LANKAN_PROVINCES } from "@/data/sriLankanCities";

/** Province select options — single source with the city list's typed provinces. */
const SRI_LANKAN_STATES = SRI_LANKAN_PROVINCES;
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
  const shippingMethodLabel =
    (orderDetails as { shippingMethodLabel?: string }).shippingMethodLabel ??
    order?.shippingLines?.nodes?.[0]?.methodTitle ??
    "";
  const deliveryType =
    (orderDetails as { deliveryType?: string }).deliveryType ?? "";

  let saved_data = {
    amount: order?.total ?? "no_amount",
    items: "Mobile Items",
    order_id: order?.databaseId?.toString() ?? "guest_checkout",
    first_name: customer?.billing?.firstName || "no_lastname",
    last_name: customer?.billing?.lastName || "no firstname",
    phone: customer?.billing?.phone || "no_phone",
    email: customer?.billing?.email || customer?.shipping?.email || "no_email",
    address: customer?.billing?.address1 || "no_address",
    lineItems: order?.lineItems || "no_items",
    subtotal: order?.subtotal || "no_subtotal",
    shippingTotal: order?.shippingTotal || "no_shippingTotal",
    date: order?.date || "no_date",
    billingaddress1: customer?.billing?.address1 || "no_address",
    billingaddress2: customer?.billing?.address2 || "no_address",
    shippingaddress1: customer?.shipping?.address1 || "no_address",
    shippingaddress2: customer?.shipping?.address2 || "no_address",
    city: customer?.billing?.city || "no_city",
    shippingMethodLabel,
    deliveryType,
  };

  // console.log("saved_data: for payment", saved_data);
  return saved_data;
};

const getRandomWelcomeMessage = () => {
  const randomIndex = Math.floor(Math.random() * WelcomeMessages.length);
  return WelcomeMessages[randomIndex].replaceAll("{brand}", siteConfig.brand.name);
};

//PAYMENT FUNCTIONS

const MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID;
const TEST: boolean = process.env.NEXT_PUBLIC_PAYHERE_IS_TESTING === "true" ? true : false;
const host = TEST ? "localhost:3000" : new URL(siteConfig.url.base).host;
const notify_url = `https://${host}/api/notify`

const STATIC_DATA = {
  sandbox: true,
  merchant_id: "1225436",
  return_url: `https://${host}/success`,
  cancel_url: `https://${host}/cancel`,
  notify_url: notify_url,
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
  sandbox: true,
  merchant_id: "1225436",
  return_url: `https://${host}/success`,
  cancel_url: `https://${host}/cancel`,
  notify_url: notify_url,
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
  iframe: true,
};

const getPaymentHash = async (dynamicData: any) => {
  try {
    const amount = TEST
      ? "100.00"
      : numberFormat(extractRawAmount(dynamicData?.amount), 2, ".", "");
    const order_id = TEST ? "ItemNo12345" : dynamicData?.order_id;

    const requestData = {
      merchant_id: TEST ? "1225436" : MERCHANT_ID,
      order_id: order_id,
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.hash;
  } catch (error) {
    console.error("Failed to fetch hash:", error);
  }
};

function numberFormat(
  amount: any,
  decimals: any,
  decimalPoint: any,
  thousandsSeparator: any
) {
  // Format the number with the specified number of decimals
  let number = parseFloat(amount).toFixed(decimals);
  // Split the number into integer and decimal parts
  let parts = number.split(".");

  // Replace the thousands separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  return parts.join(decimalPoint);
}

const sentConfirmation = async (orderId: number | string): Promise<any> => {
  const confirmationResponse = await fetch(
    apiUrl("/wp-json/api/gq_mobile/v1/order-confirmation"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_status: "completed",
      }),
    }
  );

  if (confirmationResponse.ok) {
    return true;
  }
  return false;
};


/** Utility -------------------------------------------------------------- */
const stripHtml = (html: string = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Utility to strip HTML tags and make description single line
function stripHtmlTags(html: string): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
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
  numberFormat,
  sentConfirmation,
  stripHtml,
  stripHtmlTags
};
