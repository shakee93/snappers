"use client";

import React, { useEffect, useState } from "react";
import ContactInfo from "./ContactInfo";
import ShippingAddress from "./ShippingAddress";
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
}

const CheckoutDetails: React.FC<CheckoutLeftProps> = ({
  tabActive,
  setTabActive,
  handleScrollToEl,
  updateFormData,
  formData,
  paymentGateways,
}) => {
  const { data }: QueryResult = useQuery(GET_CHECKOUT_USER_DETAILS);
  const [shippingDetails, setShippingDetails] = useState<CustomerAddress | null>(null);
  const [billingDetails, setBillingDetails] = useState<CustomerAddress | null>(null);
  const [initContactInformation, setInitContactInformation] =
    useState<contactInformation | null>(null);

  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(false);
  const [isStorePickup, setIsStorePickup] = useState(false);

  const handleCheckboxChange = () => {
    setIsBillingSameAsShipping((prevValue) => {
      const newValue = !prevValue;

      if (newValue) {
        updateFormData("shippingAddress", formData.billingAddress);
      } else {
        updateFormData("shippingAddress", {});
      }

      return newValue;
    });
  };

  const handleStorePickupChange = () => {
    setIsStorePickup((prevValue) => {
      const newValue = !prevValue;

      if (newValue) {
        updateFormData("shippingAddress", formData.billingAddress);
        updateFormData("shippingDetails",
          { "databaseId": "local_pickup", "id": "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==", "title": "StorePickup" }
        )
      } else {
        updateFormData("shippingAddress", {});
        updateFormData("shippingDetails",
        { "databaseId": null, "id": null, "title": null });
      }

      return newValue;
    });
  }

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
        />
      </div>

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
        />
      </div>

      <div className="flex justify-between">
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <Checkbox
            label=" Shipping address is the same as billing address"
            name="checkbox"
            defaultChecked={isBillingSameAsShipping}
            onChange={handleCheckboxChange}
            className=""
          />
        </div>

        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <Checkbox
            label="Store Pickup"
            name="checkbox"
            defaultChecked={isStorePickup}
            onChange={handleStorePickupChange}
          />
        </div>
      </div>

      <div id="ShippingAddress" className="scroll-mt-24">

        {(!isBillingSameAsShipping && !isStorePickup) && (
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
          />)}
      </div>

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
        />
      </div>
    </div>
  );
};

export default CheckoutDetails;
