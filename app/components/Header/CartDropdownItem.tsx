import {CartItem, PaCapacity, SimpleProduct, VariableProduct} from "@/graphql/types/graphql";
import useProductLink from "@/hooks/useProductLink";
import Image from "next/image";
import Link from "next/link";
import {Fragment} from "react";
import AttributeIcon from "@/app/components/AttributeIcon";
import Prices from "@/app/components/Prices";
import {useCart} from "@/context/CartProvider";


interface CartDropdownItemProps {
    item: CartItem
    close: () => void
}

const CartDropdownItem = ({ item,  close }: CartDropdownItemProps) => {
    const {removeFromCart} = useCart();

    const { product, variation, quantity, key  } = item;


    // @ts-ignore
    const { name, image, price, slug, salePrice, type, stockQuantity, variations, regularPrice, brands } : SimpleProduct & VariableProduct = product.node;

    // console.log(product, variation);

    const link = useProductLink(product?.node)

    if (!product?.node) {
        return null
    }

    return <div className="flex py-5 last:pb-0">
        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <Image fill style={{ objectFit: 'cover' }}
                   layout="fill"
                   src={image?.sourceUrl || ''}
                   alt={name || ''}
                   className="h-full w-full object-contain object-center"
            />
            <Link
                onClick={close}
                className="absolute inset-0"
                href={link}
            />
        </div>

        <div className="ml-4 flex flex-1 flex-col">
            <div>
                <div className="flex justify-between ">
                    <div>
                        <h3 className="text-base font-medium ">
                            <Link onClick={close} href={link}>
                                {name}
                            </Link>
                        </h3>
                        {type === 'VARIABLE' &&
                            <p className="my-1 text-sm text-slate-500 dark:text-slate-400">

                                {variation?.attributes?.map((attr, index) =>
                                    <Fragment key={index}>
                                        <div className='flex items-center gap-1'>
                                            <AttributeIcon name={attr?.name || ''} className='w-4'/> <span key={attr?.value}> {(product.node as unknown as VariableProduct)[`allPa${attr?.label as unknown as 'Capacity'}`]?.nodes.find((node: PaCapacity) => node.slug === attr?.value)?.name}</span>
                                        </div>
                                    </Fragment>
                                )}

                            </p>
                        }

                    </div>
                    <Prices salePrice={type === 'VARIABLE' ? variation?.node.regularPrice : regularPrice}
                            price={type === 'VARIABLE' ? variation?.node.price : price}
                            className="mt-0.5 flex-col" />
                </div>
            </div>
            <div className="flex flex-1 items-center justify-between text-sm">
                <p className="text-gray-500 dark:text-slate-400">Qty {quantity}</p>

                <div className="flex">
                    <button
                        onClick={e => removeFromCart([
                            key
                        ])}
                        type="button"
                        className="font-medium text-primary-6000 dark:text-primary-500 "
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    </div>


}

export default CartDropdownItem