"use client";

import { useEffect, useState } from "react";
import UnifiedCheckoutForm, { CheckoutSubmitPayload } from "./UnifiedCheckoutForm";
import { QueryResult, useQuery } from "@apollo/client";
import { GET_CHECKOUT_USER_DETAILS } from "@/graphql/defs/order";
import { GET_PRICE_FLUCTUATION_NOTICE } from "@/graphql/defs/options";
import { Customer, CustomerAddress } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import { CheckoutFormSkeleton } from "./CheckoutSkeletons";

interface CheckoutLeftProps {
  paymentGateways: any[];
  setIsStorePickup: (v: boolean) => void;
  isStorePickup: boolean;
  isCardPayment: boolean;
  setIsCardPayment: (v: boolean) => void;
  totalPayment: any;
  kokoTotal: number;
  setIsKokoPayment: (v: boolean) => void;
  isKokoPayment: boolean;
  onCheckoutSubmit: (payload: CheckoutSubmitPayload) => Promise<void> | void;
  isTOC: boolean;
  onTOCChange: () => void;
  tocError: boolean;
  loading: boolean;
  orderTotalLabel: string;
}

const CheckoutDetails = ({
  paymentGateways,
  setIsStorePickup,
  isStorePickup,
  isCardPayment,
  setIsCardPayment,
  totalPayment,
  kokoTotal,
  setIsKokoPayment,
  isKokoPayment,
  onCheckoutSubmit,
  isTOC,
  onTOCChange,
  tocError,
  loading,
  orderTotalLabel,
}: CheckoutLeftProps) => {

  const { data, loading: dataLoading }: QueryResult = useQuery(GET_CHECKOUT_USER_DETAILS);
  const { data: isPriceFluctuation } = useQuery(GET_PRICE_FLUCTUATION_NOTICE);
  const [shippingDetails, setShippingDetails] = useState<CustomerAddress | null>(null);

  const [initContactInformation, setInitContactInformation] =
    useState<contactInformation | null>(null);

  useEffect(() => {
    if (data) {
      const { displayName, email, shipping } = data.customer as Customer;
      setInitContactInformation({
        phone: shipping?.phone || "",
        email: email || "",
        displayName: displayName || "",
      });
      if (shipping) {
        setShippingDetails(shipping);
      }
    }
  }, [data]);

  if (dataLoading) {
    return <CheckoutFormSkeleton />
  }

  return (
    <div className="space-y-8">
      <UnifiedCheckoutForm
        initialContactData={initContactInformation!}
        initialShippingData={shippingDetails}
        paymentGateways={paymentGateways}
        setIsStorePickup={setIsStorePickup}
        isStorePickup={isStorePickup}
        setIsCardPayment={setIsCardPayment}
        isCardPayment={isCardPayment}
        totalPayment={totalPayment}
        kokoTotal={kokoTotal}
        setIsKokoPayment={setIsKokoPayment}
        isKokoPayment={isKokoPayment}
        isPriceFluctuation={isPriceFluctuation}
        onCheckoutSubmit={onCheckoutSubmit}
        isTOC={isTOC}
        onTOCChange={onTOCChange}
        tocError={tocError}
        loading={loading}
        orderTotalLabel={orderTotalLabel}
      />
    </div>
  );
};

export default CheckoutDetails;
