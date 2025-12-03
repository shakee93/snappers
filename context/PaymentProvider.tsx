"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { GET_PAYMENT_GATEWAYS } from "@/graphql/defs/cart";
import { PaymentGateway } from "@/graphql/types/graphql";

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

  const paymentGateways: PaymentGateway[] = data?.paymentGateways?.nodes || [];

  // Check if Koko payment (darazbnpl) is enabled
  const isKokoEnabled = paymentGateways.some(gateway => gateway.id === "darazbnpl");

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