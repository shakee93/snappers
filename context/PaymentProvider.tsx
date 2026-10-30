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

  const gatewayOrder: readonly string[] = siteConfig.payment.gatewayOrder;

  // Only the configured gateways, in the configured order.
  const paymentGateways: PaymentGateway[] = (data?.paymentGateways?.nodes || [])
    .filter((gateway: PaymentGateway) => gatewayOrder.includes(gateway.id || ''))
    .sort(
      (a: PaymentGateway, b: PaymentGateway) =>
        gatewayOrder.indexOf(a.id || '') - gatewayOrder.indexOf(b.id || ''),
    );

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