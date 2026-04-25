import { PaymentProvider } from "@/context/PaymentProvider";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutFooter from "./CheckoutFooter";

const CheckoutLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <PaymentProvider>
      <CheckoutHeader />
      {children}
      <CheckoutFooter />
    </PaymentProvider>
  );
};

export default CheckoutLayout;
