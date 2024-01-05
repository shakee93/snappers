"use client";

import React, { useEffect, useState } from "react";
import ContactInfo from "./ContactInfo";
import ShippingAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import { QueryResult, useLazyQuery, useQuery } from "@apollo/client";
import { useSession } from "@/context/SessionProvider";
import { GET_CHECKOUT_USER_DETAILS } from "@/graphql/defs/order";
import { Customer, CustomerAddress } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import BillingAddress from "./BillingAddress";
import Checkbox from "@/shared/Checkbox/Checkbox";

interface CheckoutLeftProps {
  tabActive:
  | "ContactInfo"
  | "ShippingAddress"
  | "PaymentMethod"
  | "BillingAddress";
  setTabActive: (
    value:
      | "ContactInfo"
      | "ShippingAddress"
      | "BillingAddress"
      | "PaymentMethod"
  ) => void;
  handleScrollToEl: (id: string) => void;
  updateFormData: (section: string, data: any) => void;
  formData: any;
  paymentGateways: any[];
  onStorePickupChange: any;
  handleConfirmationChange: any;
  setIsStorePickupHidden: any;
  isStorePickup : boolean;
}

const CheckoutDetails: React.FC<CheckoutLeftProps> = ({
  tabActive,
  setTabActive,
  handleScrollToEl,
  updateFormData,
  formData,
  paymentGateways,
  onStorePickupChange,
  handleConfirmationChange
}) => {
  const { data }: QueryResult = useQuery(GET_CHECKOUT_USER_DETAILS);
  const [shippingDetails, setShippingDetails] = useState<CustomerAddress | null>(null);
  const [billingDetails, setBillingDetails] = useState<CustomerAddress | null>(null);
  const [initContactInformation, setInitContactInformation] =
    useState<contactInformation | null>(null);

  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);
  const [isStorePickup, setIsStorePickup] = useState(true);

  const [isBillingAddressHidden, setIsBillingAddressHidden] = useState(false);

  useEffect(() => {
    setIsBillingAddressHidden(isBillingSameAsShipping || isStorePickup );
  }, [isBillingSameAsShipping, isStorePickup]);

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
      } else {
        console.log("shipping is null");
      }

      if (billing) {
        setBillingDetails(billing);
      } else {
        console.log("billing is null");
      }
    }
  }, [data]);

  return (
    <div className="space-y-8">

      <div id="ContactInfo" className="scroll-mt-24">
        <ContactInfo
          isActive={tabActive === "ContactInfo"}
          onOpenActive={() => {
            setTabActive("ContactInfo");
            handleScrollToEl("ContactInfo");
          }}
          onCloseActive={() => {
            setTabActive("BillingAddress");
            handleScrollToEl("BillingAddress");
          }}
          updateFormData={(section, data) => {
            updateFormData(section, data);
          }}
          initialData={initContactInformation!}
          handleConfirmationChange={(value: any) => handleConfirmationChange("contactInfo", value)}
        />
      </div>

      <div id="ShippingAddress" className="scroll-mt-24">
        <ShippingAddress
          isActive={tabActive === "ShippingAddress"}
          onOpenActive={() => {
            setTabActive("ShippingAddress");
            handleScrollToEl("ShippingAddress");
          }}
          onCloseActive={() => {
            setTabActive("PaymentMethod");
            handleScrollToEl("PaymentMethod");
          }}
          updateFormData={(section, data) => {
            updateFormData(section, data);
          }}
          initialData={shippingDetails!}
          formData={formData}
          handleConfirmationChange={(value: any) => handleConfirmationChange("shippingAddress", value)}
          updateBillingVisibility={(isVisible: boolean) => setIsBillingAddressHidden(isVisible)}
          isStorePickup={isStorePickup}
        />
      </div>

      {!isBillingAddressHidden && (
        <div id="BillingAddress" className="scroll-mt-24">
          <BillingAddress
            isActive={tabActive === "BillingAddress"}
            onOpenActive={() => {
              setTabActive("BillingAddress");
              handleScrollToEl("BillingAddress");
            }}
            onCloseActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("");
            }}
            updateFormData={(section, data) => {
              updateFormData(section, data);
            }}
            initialData={billingDetails!}
            handleConfirmationChange={(value: any) => handleConfirmationChange("billingAddress", value)}
          />
        </div>)}

      <div id="PaymentMethod" className="scroll-mt-24">
        <PaymentMethod
          isActive={tabActive === "PaymentMethod"}
          onOpenActive={() => {
            setTabActive("PaymentMethod");
            handleScrollToEl("PaymentMethod");
          }}
          onCloseActive={() => setTabActive("PaymentMethod")}
          paymentGateways={paymentGateways}
          updateFormData={(section, data) => {
            updateFormData(section, data);
          }}
          isBillingAddressEnabled={isBillingAddressHidden}
          handleConfirmationChange={(value: any) => handleConfirmationChange("paymentMethod", value)}
        />
      </div>
    </div>
  );
};

export default CheckoutDetails;
