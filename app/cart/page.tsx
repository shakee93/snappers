import CartPage from "@/app/containers/ProductDetailPage/CartPage";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Your Cart'
}
const Cart = () => {
    return <div>
        <CartPage/>
    </div>
}

export default Cart