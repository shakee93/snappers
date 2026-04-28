import { PaymentProvider } from "@/context/PaymentProvider";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PaymentProvider>{children}</PaymentProvider>;
}
