import { PaymentProvider } from "@/context/PaymentProvider";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PaymentProvider>{children}</PaymentProvider>;
}
