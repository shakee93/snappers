"use client";

import { useEffect, useState } from "react";
import UnifiedCheckoutForm from "./UnifiedCheckoutForm";
import { QueryResult, useQuery } from "@apollo/client";
import { GET_CHECKOUT_USER_DETAILS } from "@/graphql/defs/order";
import { GET_PRICE_FLUCTUATION_NOTICE } from "@/graphql/defs/options";
import { Customer, CustomerAddress } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import { CheckoutDetailsSkeleton } from "@/app/checkout/[order-id]/Skeleton";

interface CheckoutLeftProps {
  tabActive:
  | "ContactInfo"
  | "DeliveryAddress"
  | "PaymentMethod"
  | "BillingAddress"
  | "order-cart";
  setTabActive: (
    value:
      | "ContactInfo"
      | "DeliveryAddress"
      | "BillingAddress"
      | "PaymentMethod"
      | "order-cart"
  ) => void;
  handleScrollToEl: (id: string) => void;
  updateFormData: (section: string, data: any) => void;
  formData: any;
  paymentGateways: any[];
  setIsStorePickup: any;
  handleConfirmationChange: any;
  isStorePickup: boolean;
  isCardPayment: boolean;
  setIsCardPayment: any;
  totalPayment: any;
  setIsKokoPayment: any;
  isKokoPayment: boolean;
}

const CheckoutDetails = ({
  tabActive,
  setTabActive,
  handleScrollToEl,
  updateFormData,
  formData,
  paymentGateways,
  setIsStorePickup,
  handleConfirmationChange,
  isStorePickup,
  isCardPayment,
  setIsCardPayment,
  totalPayment,
  setIsKokoPayment,
  isKokoPayment
}: CheckoutLeftProps) => {

  const { data, loading: dataLoading }: QueryResult = useQuery(GET_CHECKOUT_USER_DETAILS);
  const { data: isPriceFluctuation, loading, error } = useQuery(GET_PRICE_FLUCTUATION_NOTICE);
  const [shippingDetails, setShippingDetails] = useState<CustomerAddress | null>(null);
  const [billingDetails, setBillingDetails] = useState<CustomerAddress | null>(null);

  const [initContactInformation, setInitContactInformation] =
    useState<contactInformation | null>(null);

  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);

  const [isBillingAddressHidden, setIsBillingAddressHidden] = useState(false);

  useEffect(() => {
    if (isStorePickup == true) {
      setIsStorePickup(true);
      handleConfirmationChange("billingAddress", true);
    }
    setIsBillingAddressHidden(isBillingSameAsShipping || isStorePickup);
    if (!isBillingAddressHidden) {
      handleConfirmationChange("billingAddress", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorePickup, isBillingSameAsShipping]);


  useEffect(() => {
    if (data) {
      const { displayName, email, shipping, billing } = data.customer as Customer;
      setInitContactInformation({
        phone: shipping?.phone || "",
        email: email || "",
        displayName: displayName || "",
      });
      if (shipping) {
        setShippingDetails(shipping);
      }
      if (billing) {
        setBillingDetails(billing);
      }
    }
  }, [data]);

  if (dataLoading) {
    return <CheckoutDetailsSkeleton />
  }

  return (
    <div className="space-y-8">
      <UnifiedCheckoutForm
        updateFormData={updateFormData}
        formData={formData}
        initialContactData={initContactInformation!}
        initialShippingData={shippingDetails}
        paymentGateways={paymentGateways}
        handleConfirmationChange={handleConfirmationChange}
        setIsStorePickup={setIsStorePickup}
        isStorePickup={isStorePickup}
        setIsCardPayment={setIsCardPayment}
        isCardPayment={isCardPayment}
        totalPayment={totalPayment}
        setIsKokoPayment={setIsKokoPayment}
        isKokoPayment={isKokoPayment}
        isPriceFluctuation={isPriceFluctuation}
        onFormSubmit={() => {
          setTabActive("order-cart");
          handleScrollToEl("order-cart");
        }}
      />
    </div>
  );
};

export default CheckoutDetails;
