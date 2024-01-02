"use client";

import React, { useEffect, useState } from 'react';
import ContactInfo from './ContactInfo';
import ShippingAddress from './ShippingAddress';
import PaymentMethod from './PaymentMethod';
import { QueryResult, useLazyQuery, useQuery } from '@apollo/client';
import { useSession } from '@/context/SessionProvider';
import { GET_CHECKOUT_USER_DETAILS } from '@/graphql/defs/order';
import { Customer, CustomerAddress } from '@/graphql/types/graphql';
import { contactInformation } from '@/data/types';




interface CheckoutLeftProps {
    tabActive: "ContactInfo" | "ShippingAddress" | "PaymentMethod";
    setTabActive: (value: "ContactInfo" | "ShippingAddress" | "PaymentMethod") => void;
    handleScrollToEl: (id: string) => void;
    updateFormData: (section: string, data: any) => void;
    paymentGateways: any[];
}



const CheckoutDetails: React.FC<CheckoutLeftProps> = ({ tabActive, setTabActive, handleScrollToEl, updateFormData, paymentGateways }) => {

    const { data }: QueryResult = useQuery(GET_CHECKOUT_USER_DETAILS);
    const [shippingDetails, setShippingDetails] = useState<CustomerAddress | null>(null);
    const [initContactInformation, setInitContactInformation ] = useState<contactInformation | null>(null);

    useEffect(() => {
        if (data) {
            const { displayName, email, shipping } = data.customer as Customer;
            setInitContactInformation({
                phone: shipping?.phone || "",
                email: email || "",
                displayName: displayName || "",
            })


            if (shipping) {
                setShippingDetails(shipping)
            }else{
                console.log("shipping is null");
            }
            // shipping;
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
                        setTabActive("ShippingAddress");
                        handleScrollToEl("ShippingAddress");
                    }}
                    updateFormData={(section, data) => {
                        updateFormData(section, data);
                    }}
                    initialData={initContactInformation!}
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
                />
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