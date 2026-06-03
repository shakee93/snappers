import {
  CartItem,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import useProductLink from "@/hooks/useProductLink";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import LineOrCartPriceLabel from "@/components/global/ui/LineOrCartPriceLabel";
import { useCart } from "@/context/CartProvider";
import NcInputNumber from "@/components/global/primitives/NcInputNumber";
import { Trash } from "lucide-react";
import { isLineItemFree } from "@/lib/cartLinePricing";
import { getCartLineStockCap } from "@/lib/cartLineStockCap";

interface CartDropdownItemProps {
  item: CartItem;
  close: () => void;
}

const CartDropdownItem = ({ item, close }: CartDropdownItemProps) => {
  const { removeFromCart, updateCart } = useCart();

  const { product, variation, quantity, key, total, subtotal } = item;
  const lineIsFree = isLineItemFree(total, subtotal);

  // States to manage loading indicators
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // @ts-ignore
  const {
    name,
    image,
    price,
    type,
    regularPrice,
  }: SimpleProduct & VariableProduct = product?.node;

  const { maxQty } = getCartLineStockCap(item);
  const maxQtyProp = maxQty ?? undefined;

  const link = useProductLink(product?.node);

  if (!product?.node) {
    return null;
  }

  const handleRemoveFromCart = async () => {
    if (isRemoving || isUpdating) return; // Prevent action if already in progress
    setIsRemoving(true);
    try {
      await removeFromCart([key]);
    } catch (error) {
      console.error('Error removing item:', error);
    }
    setIsRemoving(false);
  };

  const handleQuantityUpdate = async (newQuantity: number) => {
    if (isRemoving || isUpdating) return; // Prevent update if any operation is in progress
    setIsUpdating(true);
    try {
      await updateCart(key, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
    setIsUpdating(false);
  };

  return (
    <div className={`flex px-3 py-4 border rounded-md relative bg-gradient-to-t from-gray-100/70 to-white ${(isRemoving || isUpdating) ? 'opacity-70' : ''}`}>
      {/* Loading overlay */}
      {(isRemoving || isUpdating) && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/50 rounded-md flex items-center justify-center z-40">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-300">
              {isRemoving ? 'Removing...' : 'Updating...'}
            </span>
          </div>
        </div>
      )}

      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <Image
          fill
          style={{ objectFit: "cover" }}
          layout="fill"
          src={product.node.type === "VARIABLE"
            ? variation?.node.image?.sourceUrl || ""
            : product.node.image?.sourceUrl || product.node.image?.mediaItemUrl || ""}
          alt={name || ""}
          className="h-full w-full object-contain object-center"
        />
        <Link onClick={close} className="absolute inset-0" href={link} />
      </div>

      <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
        <div>
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold mt-3">
                <Link href={link}>{name}</Link>
              </h3>

              <LineOrCartPriceLabel
                lineTotal={total}
                lineSubtotal={subtotal}
                catalogSalePrice={
                  type === "VARIABLE"
                    ? variation?.node.regularPrice
                    : regularPrice
                }
                catalogPrice={
                  type === "VARIABLE" ? variation?.node.price : price
                }
                className="mt-0.5"
              />
            </div>

            <div className="flex-1 sm:flex justify-end items-end">
              <div className="flex flex-row items-center justify-between w-full gap-4 mt-6">
                <NcInputNumber
                  onChange={(q) => !isRemoving && !isUpdating && handleQuantityUpdate(q)}
                  defaultValue={quantity || 1}
                  max={maxQtyProp}
                  className={`relative z-10 ${(isRemoving || isUpdating) ? 'opacity-50 pointer-events-none' : ''}`}
                  disabled={lineIsFree || isRemoving || isUpdating}
                />
                <button
                  className={`relative z-10 flex items-center justify-center font-medium text-red-600 hover:text-white text-base ml-2 transition-colors duration-150
                    ${isRemoving || isUpdating
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-red-50 hover:bg-red-600 cursor-pointer'
                    } rounded-full w-8 h-8 shadow-sm border border-red-100`}
                  onClick={handleRemoveFromCart}
                  disabled={isRemoving || isUpdating}
                  title="Remove"
                >
                  <Trash size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDropdownItem;
