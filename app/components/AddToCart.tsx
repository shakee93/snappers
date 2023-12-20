'use client'


import {Product} from "@/graphql/defs/types/graphql";
import {useMutation, useQuery} from "@apollo/client";
import {ADD_TO_CART, GET_CART} from "@/graphql/defs/cart";
import {useSession} from "@/context/SessionProvider";
import {useCart} from "@/context/CartProvider";

const AddToCart = ({ product }: {product: Product}) => {

    const { addToCart } = useCart()


    return <div>
        {product.type === 'SIMPLE' &&
            <button onClick={e => addToCart(product.databaseId)} className='border px-2 py-2 bg-blue-500 rounded'>
                Add to Cart
            </button>
        }

        {product.type === 'VARIABLE' &&

            <div>
                <button className='border px-2 py-2 bg-blue-500 rounded'>
                    SEE OPTIONS
                </button>
            </div>
        }

    </div>

}

export default AddToCart