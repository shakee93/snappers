import { PaymentProvider } from "@/context/PaymentProvider";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutFooter from "./CheckoutFooter";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PaymentProvider>
      <CheckoutHeader />
      {children}
      <CheckoutFooter />
    </PaymentProvider>
  );
}
