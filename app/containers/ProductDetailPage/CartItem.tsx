import {SimpleProduct, VariableProduct} from "@/graphql/defs/types/graphql";
import Image from "next/image";
import Link from "next/link";
import Prices from "@/app/components/Prices";
import NcInputNumber from "@/components/NcInputNumber";
import {CartItem} from "@/lib/graphql/types/graphql";
import {useCart} from "@/context/CartProvider";


const CartItemProduct = ({
    cartItem,
    index
                  }: {
    cartItem : CartItem,
    index: number
}) => {

    const { product, quantity, key  } = cartItem;
    const { removeFromCart, updateCart } = useCart()

    if (!product?.node) {
        return null
    }

    const { name, image, price, slug, salePrice, type, stockQuantity } : SimpleProduct | VariableProduct = product.node;


    return (
        <div
            className="relative flex py-8 sm:py-10 xl:py-12 first:pt-0 last:pb-0"
        >
            <div className="relative h-36 w-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <Image fill style={{ objectFit: 'cover' }}
                       src={image?.sourceUrl || ''}
                       alt={name || ''}
                       className="h-full w-full object-contain object-center"
                />
                <Link href={`/product/${slug}`} className="absolute inset-0"></Link>
            </div>

            <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
                <div>
                    <div className="flex justify-between ">
                        <div className="flex-[1.5] ">
                            <h3 className="text-base font-semibold">
                                <Link href={`/product/${slug}`}>{name}</Link>
                            </h3>

                            {type === 'VARIABLE' &&
                                <div className="mt-1.5 sm:mt-2.5 flex text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center space-x-1.5">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M7.01 18.0001L3 13.9901C1.66 12.6501 1.66 11.32 3 9.98004L9.68 3.30005L17.03 10.6501C17.4 11.0201 17.4 11.6201 17.03 11.9901L11.01 18.0101C9.69 19.3301 8.35 19.3301 7.01 18.0001Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeMiterlimit="10"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M8.35 1.94995L9.69 3.28992"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeMiterlimit="10"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M2.07 11.92L17.19 11.26"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeMiterlimit="10"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M3 22H16"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeMiterlimit="10"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M18.85 15C18.85 15 17 17.01 17 18.24C17 19.26 17.83 20.09 18.85 20.09C19.87 20.09 20.7 19.26 20.7 18.24C20.7 17.01 18.85 15 18.85 15Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        <span>{`Black`}</span>
                                    </div>
                                    <span className="mx-4 border-l border-slate-200 dark:border-slate-700 "></span>
                                    <div className="flex items-center space-x-1.5">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M21 9V3H15"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M3 15V21H9"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M21 3L13.5 10.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M10.5 13.5L3 21"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        <span>{`2XL`}</span>
                                    </div>
                                </div>

                            }
                            <div className="mt-3 flex justify-between w-full sm:hidden relative">
                                <select
                                    name="qty"
                                    id="qty"
                                    className="form-select text-sm rounded-md py-1 border-slate-200 dark:border-slate-700 relative z-10 dark:bg-slate-800 "
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                </select>
                                <Prices
                                    contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                                    price={price}
                                    salePrice={salePrice}
                                />
                            </div>
                        </div>

                        <div className="hidden sm:block text-center relative">
                            <NcInputNumber onChange={async q => {
                                await updateCart(key, q)

                            }} defaultValue={quantity || 1} className="relative z-10" />
                        </div>

                        <div className="hidden flex-1 sm:flex justify-end">
                            <Prices salePrice={salePrice} price={price} className="mt-0.5" />
                        </div>
                    </div>
                </div>

                <div className="flex mt-auto pt-4 items-end justify-between text-sm">
                    {/*{stockQuantity && stockQuantity > 0*/}
                    {/*  ? renderStatusInstock()*/}
                    {/*  : renderStatusSoldout()*/}
                    {/*}*/}

                    <div></div>

                    <button
                        onClick={e => removeFromCart([
                            key
                        ])}
                        className="relative z-10 flex items-center mt-3 font-medium text-primary-6000 hover:text-primary-500 text-sm "
                    >
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CartItemProduct