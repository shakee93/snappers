'use client'
import { Popover, Transition } from "@headlessui/react";
import Prices from "@/app/components/Prices";
import { Product, PRODUCTS } from "@/data/data";
import { ShoppingBag } from "lucide-react";
import {Fragment, useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import {useCart} from "@/context/CartProvider";
import {CartItem, PaCapacity, ProductAllPaCapacityArgs, SimpleProduct, VariableProduct} from "@/graphql/types/graphql";
import AttributeIcon from "@/app/components/AttributeIcon";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";

export default function CartDropdown() {

  const {cart, removeFromCart} = useCart();

  const renderProduct = (item: CartItem, index: number, close: () => void) => {
    const { product, variation, quantity, key  } = item;

      if (!product?.node) {
      return null
    }

      const { name, image, price, slug, salePrice, type, stockQuantity, variations, regularPrice } : SimpleProduct & VariableProduct = product.node;

    return (
      <div key={index} className="flex py-5 last:pb-0">
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
            href={`/product/${slug}`}
          />
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="text-base font-medium ">
                  <Link onClick={close} href={`/product/${slug}`}>
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
    );
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`
                ${open ? "" : "text-opacity-90"}
                 group w-10 h-10 sm:w-12 sm:h-12 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative`}
          >
            {!!cart?.contents?.itemCount &&
                <div className="w-3.5 h-3.5 flex items-center justify-center bg-primary-500 absolute top-1.5 right-1.5 rounded-full text-[10px] leading-none text-white font-medium">
                  <span className="mt-[1px]">{cart?.contents?.itemCount}</span>
                </div>
            }

            <div className="text-primaryColor">
              <ShoppingBag/>
            </div>


            <Link className="block md:hidden absolute inset-0" href={"/cart"} />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="hidden md:block absolute z-[100] w-screen max-w-xs sm:max-w-md px-4 mt-3.5 -right-28 sm:right-0 sm:px-0">
              <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                <div className="relative bg-white dark:bg-neutral-800">
                  <div className="max-h-[60vh] p-5 overflow-y-auto hiddenScrollbar">
                    <h3 className="text-xl font-semibold">Shopping cart</h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {cart?.contents?.nodes?.map(
                        (item, index) => renderProduct(item, index, close)
                      )}
                    </div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-slate-900 p-5">
                    <p className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                      <span>
                        <span>Subtotal</span>
                        <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">
                          Shipping and taxes calculated at checkout.
                        </span>
                      </span>
                      <span className="">{cart?.subtotal}</span>
                    </p>
                    <div className="flex space-x-2 mt-5">
                      <ButtonSecondary
                        href="/cart"
                        className="flex-1 border border-slate-200 dark:border-slate-700"
                        onClick={close}
                      >
                        View cart
                      </ButtonSecondary>
                      <ButtonPrimary
                        href="/checkout"
                        onClick={close}
                        className="flex-1"
                      >
                        Checkout
                      </ButtonPrimary>
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
