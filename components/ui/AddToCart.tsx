'use client'


import {Product} from "@/graphql/types/graphql";
import {useCart} from "@/context/CartProvider";

const AddToCart = ({ product }: {product: Product}) => {

    const { addToCart } = useCart()

    return <div>
        {product.type === 'SIMPLE' &&
            <button onClick={e => addToCart(product.databaseId)} className='border cursor-pointer px-2 py-2 bg-blue-500 rounded'>
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