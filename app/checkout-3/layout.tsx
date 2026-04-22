import { PaymentProvider } from "@/context/PaymentProvider";

const CheckoutLayout = ({ children }: { children: React.ReactNode }) => {

    return (
        <PaymentProvider>
            {children}
        </PaymentProvider>
    )
}

export default CheckoutLayout;