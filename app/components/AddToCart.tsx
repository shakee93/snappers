'use client'


import {Product} from "@/graphql/defs/types/graphql";
import {useMutation, useQuery} from "@apollo/client";
import {ADD_TO_CART, GET_CART} from "@/graphql/defs/cart";
import {useSession} from "@/context/SessionProvider";

const AddToCart = ({ product }: {product: Product}) => {

    const { sessionToken } = useSession()

    const [addToCart, { loading: adding }] = useMutation(ADD_TO_CART, {
        variables: {
            productId: product.databaseId
        },
        onCompleted({ addToCart: data }) {
            console.log('done!');
        },
    });

    return <div>
        {product.type === 'SIMPLE' &&
            <button onClick={e => addToCart()} className='border px-2 py-2 bg-blue-500 rounded'>
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