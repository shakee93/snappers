"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { GET_PAYMENT_GATEWAYS } from "@/graphql/defs/cart";
import { PaymentGateway } from "@/graphql/types/graphql";
import { siteConfig } from "@/site.config";

interface PaymentContextType {
  paymentGateways: PaymentGateway[] | null;
  loading: boolean;
  error: any;
  isKokoEnabled: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data, loading, error } = useQuery(GET_PAYMENT_GATEWAYS);

  // Define custom order for payment gateways
  const gatewayOrder: readonly string[] = siteConfig.payment.gatewayOrder;

  // Sort payment gateways based on custom order
  const paymentGateways: PaymentGateway[] = (data?.paymentGateways?.nodes || [])
    .slice()
    .sort((a: PaymentGateway, b: PaymentGateway) => {
      const indexA = gatewayOrder.indexOf(a.id || '');
      const indexB = gatewayOrder.indexOf(b.id || '');
      // If gateway not in order list, put it at the end
      const orderA = indexA === -1 ? gatewayOrder.length : indexA;
      const orderB = indexB === -1 ? gatewayOrder.length : indexB;
      return orderA - orderB;
    });

  // Check if Koko payment (darazbnpl) is enabled
  const isKokoEnabled = paymentGateways.some(gateway => gateway.id === siteConfig.payment.kokoGatewayId);

  return (
    <PaymentContext.Provider
      value={{
        paymentGateways,
        loading,
        error,
        isKokoEnabled,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentGateways = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePaymentGateways must be used within a PaymentProvider");
  }
  return context;
}; 