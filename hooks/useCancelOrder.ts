"use client";

import { useCallback, useRef, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { AUTH_TOKEN_KEY } from "@/utils/storage-keys";
import {
  CUSTOMER_CANCEL_ORDER,
  GET_MY_ORDERS,
  type MyOrder,
} from "@/graphql/defs/order";

type CustomerCancelOrderResponse = {
  customerCancelOrder?: {
    orderId?: number | null;
    status?: string | null;
  } | null;
};

type CustomerCancelOrderVars = {
  orderId: number;
};

export function useCancelOrder() {
  const client = useApolloClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const [runCancelOrder] = useMutation<
    CustomerCancelOrderResponse,
    CustomerCancelOrderVars
  >(CUSTOMER_CANCEL_ORDER);

  const cancelOrder = useCallback(
    async (order: MyOrder): Promise<boolean> => {
      if (inFlightRef.current) return false;

      if (!order.databaseId) {
        toast.error("Unable to cancel order. Please try again.");
        return false;
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(AUTH_TOKEN_KEY)
          : null;
      if (!token) {
        toast.error("Please sign in to cancel this order.");
        return false;
      }

      inFlightRef.current = true;
      setCancellingId(order.id);

      try {
        const { data, errors } = await runCancelOrder({
          variables: { orderId: order.databaseId },
        });

        const finalStatus = data?.customerCancelOrder?.status;
        if (errors?.length || finalStatus !== "cancelled") {
          const message = errors?.[0]?.message?.trim();
          console.error("[cancelOrder] Mutation rejected:", errors, data);
          toast.error(message || "Unable to cancel order. Please try again.");
          return false;
        }

        // Refetch orders so the client-side Apollo cache reflects the new
        // CANCELLED status; the mutation only touches the WP order record.
        await client.refetchQueries({ include: [GET_MY_ORDERS] });

        toast.success("Order cancelled.");
        return true;
      } catch (error) {
        console.error("[cancelOrder] Network/exception:", error);
        toast.error("Unable to cancel order. Please try again.");
        return false;
      } finally {
        inFlightRef.current = false;
        setCancellingId(null);
      }
    },
    [client, runCancelOrder],
  );

  return { cancelOrder, cancellingId };
}
