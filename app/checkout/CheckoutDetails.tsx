import React from 'react';
import ContactInfo from './ContactInfo';
import ShippingAddress from './ShippingAddress';
import PaymentMethod from './PaymentMethod';

interface CheckoutLeftProps {
    tabActive: "ContactInfo" | "ShippingAddress" | "PaymentMethod";
    setTabActive: (value: "ContactInfo" | "ShippingAddress" | "PaymentMethod") => void;
    handleScrollToEl: (id: string) => void;
    updateFormData: (section: string, data: any) => void;
    paymentGateways: any[];
}


const CheckoutDetails: React.FC<CheckoutLeftProps> = ({ tabActive, setTabActive, handleScrollToEl, updateFormData, paymentGateways }) => {
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