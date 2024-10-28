"use client";

import React, { useEffect, useState } from "react";
import ContactInfo from "./ContactInfo";
import DeliveryAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import { QueryResult, useQuery } from "@apollo/client";
import { GET_CHECKOUT_USER_DETAILS } from "@/graphql/defs/order";
import { GET_PRICE_FLUCTUATION_NOTICE } from "@/graphql/defs/options";
import { Customer, CustomerAddress } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import BillingAddress from "./BillingAddress";
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
}

const CheckoutDetails: React.FC<CheckoutLeftProps> = ({
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
  totalPayment
}) => {

  const { data, loading: dataLoading }: QueryResult = useQuery(GET_CHECKOUT_USER_DETAILS);
  const { data: isPriceFluctuation, loading, error } = useQuery(GET_PRICE_FLUCTUATION_NOTICE);
  const [shippingDetails, setShippingDetails] =
    useState<CustomerAddress | null>(null);
  const [billingDetails, setBillingDetails] = useState<CustomerAddress | null>(
    null
  );

  const [initContactInformation, setInitContactInformation] =
    useState<contactInformation | null>(null);

  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);

  const [isBillingAddressHidden, setIsBillingAddressHidden] = useState(false);

  useEffect(() => {
    // console.log("isStorePickup", isStorePickup);
    // console.log("isBillingSameAsShipping", isBillingSameAsShipping);
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
      const { displayName, email, shipping, billing } =
        data.customer as Customer;
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
      {/*{JSON.stringify(dataLoading)}*/}
      <div id="ContactInfo" className="scroll-mt-24">

        <ContactInfo
          isActive={tabActive === "ContactInfo"}
          onOpenActive={() => {
            setTabActive("ContactInfo");
            handleScrollToEl("ContactInfo");
          }}
          onCloseActive={() => {
            setTabActive("DeliveryAddress");
            handleScrollToEl("DeliveryAddress");
          }}
          updateFormData={(section, data) => {
            updateFormData(section, data);
          }}
          formData={formData}
          initialData={initContactInformation!}
          handleConfirmationChange={(value: any) =>
            handleConfirmationChange("contactInfo", value)
          }
        />
      </div>

      <div id="DeliveryAddress" className="scroll-mt-24">
        <DeliveryAddress
          isActive={tabActive === "DeliveryAddress"}
          onOpenActive={() => {
            setTabActive("DeliveryAddress");
            handleScrollToEl("DeliveryAddress");
          }}
          onCloseActive={() => {
            if (isBillingAddressHidden) {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            } else {
              setTabActive("BillingAddress");
              handleScrollToEl("BillingAddress");
            }
          }}
          updateFormData={(section, data) => {
            updateFormData(section, data);
          }}
          initialData={shippingDetails!}
          formData={formData}
          handleConfirmationChange={(value: any) =>
            handleConfirmationChange("deliveryAddress", value)
          }
          toggleConfirmationBillingAddress={(value: any) =>
            handleConfirmationChange("billingAddress", value)
          }
          updateBillingVisibility={(isVisible: boolean) =>
            setIsBillingAddressHidden(isVisible)
          }
          isStorePickup={isStorePickup}
          setStorePickup={setIsStorePickup}
          setDeliveryAddress={setIsBillingSameAsShipping}
        />
      </div>

      {/* {!isBillingAddressHidden && (
        <div id="BillingAddress" className="scroll-mt-24">
          <BillingAddress
            isActive={tabActive === "BillingAddress"}
            onOpenActive={() => {
              setTabActive("BillingAddress");
              handleScrollToEl("BillingAddress");
            }}
            onCloseActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("");
            }}
            updateFormData={(section, data) => {
              updateFormData(section, data);
            }}
            initialData={billingDetails!}
            handleConfirmationChange={(value: any) =>
              handleConfirmationChange("billingAddress", value)
            }
          />
        </div>
      )} */}

        <div id="PaymentMethod" className="scroll-mt-24">
          <PaymentMethod
            isActive={tabActive === "PaymentMethod"}
            onOpenActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
            onCloseActive={() => setTabActive("order-cart")}
            paymentGateways={paymentGateways}
            updateFormData={(section, data) => {
              updateFormData(section, data);
            }}
            isBillingAddressEnabled={isBillingAddressHidden}
            handleConfirmationChange={(value: any) =>
              handleConfirmationChange("paymentMethod", value)
            }
            isCardPayment={isCardPayment}
            setIsCardPayment={setIsCardPayment}
            isPriceFluctuation={isPriceFluctuation}
            totalPayment={totalPayment}
          />
        </div>
    </div>
  );
};

export default CheckoutDetails;
