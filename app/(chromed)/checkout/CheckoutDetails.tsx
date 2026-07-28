"use client";

import { useEffect, useState } from "react";
import UnifiedCheckoutForm, { CheckoutSubmitPayload, DeliveryType } from "./UnifiedCheckoutForm";
import { QueryResult } from "@apollo/client";
import { useCheckoutUserDetails } from "@/hooks/useCheckoutUserDetails";
import { CheckoutAddressSnapshot } from "@/hooks/useCheckoutAddressSync";
import { usePriceFluctuationNotice } from "@/hooks/usePriceFluctuationNotice";
import { Customer, CustomerAddress } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import { CheckoutFormSkeleton } from "./CheckoutSkeletons";

interface CheckoutLeftProps {
  paymentGateways: any[];
  setDeliveryType: (v: DeliveryType | null) => void;
  deliveryType: DeliveryType | null;
  isCardPayment: boolean;
  setIsCardPayment: (v: boolean) => void;
  totalPayment: any;
  kokoTotal: number;
  setIsKokoPayment: (v: boolean) => void;
  isKokoPayment: boolean;
  onCheckoutSubmit: (payload: CheckoutSubmitPayload) => Promise<void> | void;
  onAddressChange: (
    snapshot: CheckoutAddressSnapshot | null,
    options?: { immediate?: boolean },
  ) => void;
  isTOC: boolean;
  onTOCChange: () => void;
  tocError: boolean;
  loading: boolean;
  orderTotalLabel: string;
}

const CheckoutDetails = ({
  paymentGateways,
  setDeliveryType,
  deliveryType,
  isCardPayment,
  setIsCardPayment,
  totalPayment,
  kokoTotal,
  setIsKokoPayment,
  isKokoPayment,
  onCheckoutSubmit,
  onAddressChange,
  isTOC,
  onTOCChange,
  tocError,
  loading,
  orderTotalLabel,
}: CheckoutLeftProps) => {

  const { data, loading: dataLoading }: QueryResult = useCheckoutUserDetails();
  const { data: isPriceFluctuation } = usePriceFluctuationNotice();
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
        setDeliveryType={setDeliveryType}
        deliveryType={deliveryType}
        setIsCardPayment={setIsCardPayment}
        isCardPayment={isCardPayment}
        totalPayment={totalPayment}
        kokoTotal={kokoTotal}
        setIsKokoPayment={setIsKokoPayment}
        isKokoPayment={isKokoPayment}
        isPriceFluctuation={isPriceFluctuation}
        onCheckoutSubmit={onCheckoutSubmit}
        onAddressChange={onAddressChange}
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
