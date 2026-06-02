import { FC, useEffect, useState } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import Radio from "shared/Radio/Radio";
import Image from "next/image";

import { Cart, PaymentGateway } from "@/graphql/types/graphql";
import { useCart } from "@/context/CartProvider";
import { PAYHERE_HIDE_THRESHOLD } from "@/lib/checkoutMath";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  updateFormData: (section: string, data: any) => void;
  paymentGateways: PaymentGateway[];
  handleConfirmationChange: any;
  isBillingAddressEnabled: any;
  isCardPayment: any;
  setIsCardPayment: any;
  isPriceFluctuation: any;
  totalPayment: number;
  setIsKokoPayment: any;
  isKokoPayment: boolean;
}

const PaymentMethod: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  paymentGateways,
  updateFormData,
  handleConfirmationChange,
  isBillingAddressEnabled,
  isCardPayment,
  setIsCardPayment,
  isPriceFluctuation,
  totalPayment,
  setIsKokoPayment,
  isKokoPayment
}) => {
  const [methodActive, setMethodActive] = useState<
    "Credit-Card" | "Internet-banking" | "Wallet"
  >("Credit-Card");

  useEffect(() => { }, [paymentGateways]);

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>({
    id: "",
    title: null,
  });

  const { cart, loading } = useCart();

  const removePayhereOnMobileAndTab = () => {
    try {
      const currentCart = cart;
      if (
        !currentCart ||
        !currentCart.contents ||
        !currentCart.contents.nodes
      ) {
        return false; // Return false if cart or its contents are undefined
      }

      const categoryNames = currentCart.contents.nodes
        .map(
          (node: any) => node.product?.node?.productCategories?.nodes[0]?.name
        )
        .filter(Boolean); // Filter out undefined values


      const containsMobileOrTablet = categoryNames.some(
        (name: string) => name === "Smartphones" || name === "Tablets" || name === "1. Mobiles & Tablets"
      );

      return containsMobileOrTablet;
    } catch (error) {
      console.error("Error while processing cart:", error);
      return false;
    }
  };

  let hidePayhere = removePayhereOnMobileAndTab();
  const [isConfirmed, setIsConfirmed] = useState(false);
  let hidePayhereForMobileAndTablets = false;

  const isPreOrderProduct = (product: any) => {
    const tags = product?.productTags?.nodes || [];
    const hasPreOrderTag = tags.some((tag: any) => {
      const slug = String(tag.slug || "").toLowerCase();
      const name = String(tag.name || "").toLowerCase();
      return slug === "pre-order" || slug === "preorder" || slug.includes("pre-order") || name.includes("pre order");
    });
    if (hasPreOrderTag) return true;

    const productName = String(product?.name || "").toLowerCase();
    if (productName.includes("pre-order") || productName.includes("preorder") || productName.includes("pre order")) {
      return true;
    }

    return false;
  };

  const hasPreOrderProducts = () => {
    try {
      const currentCart = cart;
      if (!currentCart?.contents?.nodes) return false;

      return currentCart.contents.nodes.some((node: any) => {
        const productNode = node.product?.node || node.product;
        console.log("[PreOrder Debug] Cart item product:", productNode?.name, "tags:", productNode?.productTags?.nodes);
        return isPreOrderProduct(productNode);
      });
    } catch (error) {
      console.error("Error checking for pre-order products:", error);
      return false;
    }
  };

  const isPreOrderCart = hasPreOrderProducts();

  const PaymentMethods: FC<{ gateway: PaymentGateway }> = ({ gateway }) => {
    const active = methodActive === gateway.id;

    let is_tab_or_mobile = hidePayhereForMobileAndTablets ? gateway.id == "payhere" && hidePayhere : false;
    const shouldHidePayhere = gateway.id === 'payhere' && isPriceFluctuation?.topBarPriceFluctuationNotice && totalPayment >= PAYHERE_HIDE_THRESHOLD;
    
    // Hide Koko and Pay Online for pre-order products
    const shouldHideForPreOrder = isPreOrderCart && (gateway.id === 'darazbnpl' || gateway.id === 'payhere');

    return (
      !shouldHidePayhere && !shouldHideForPreOrder && (
        <div
          className={` items-start cursor-pointer space-x-4 sm:space-x-6 ${is_tab_or_mobile ? "hidden  " : "flex"
            }`}
        >
          {/* <div className={`flex items-start cursor-pointer space-x-4 sm:space-x-6 `}> */}
          <Radio
            className="cursor-pointer"
            name="payment-method"
            id={gateway.id}
            defaultChecked={active}
            onChange={(e) => {
              setMethodActive(e as any);
              setSelectedGateway({
                id: gateway.id,
                title: gateway.title,
              });

              if (gateway.id === "darazbnpl") {
                setIsKokoPayment(true);
              } else {
                setIsKokoPayment(false);
              }

              if (gateway.id === "payhere") {
                setIsCardPayment(true);
              } else {
                setIsCardPayment(false);
              }
            }}
          />
          <div className="flex-1">
            <label
              htmlFor={gateway.id}
              className="flex items-center space-x-4 sm:space-x-6"
            >
              <p className="font-medium">{gateway.id === "payhere" ? "Pay Online" : gateway.title}</p>
            </label>
            <div className={`mt-6 mb-4 ${active ? "block" : "hidden"}`}>
              {/* {gateway.icon ? (
                <Image
                  src={gateway?.icon}
                  alt="payment gateway"
                  width={1000}
                  height={1000}
                  className="pb-2"
                />
              ) : (
                <></>
              )} */}
              {/* Only show description for non-Koko payment methods */}
              {gateway.id !== "darazbnpl" && (
                <>
                  <p className="text-sm dark:text-slate-300">
                    Your order will be delivered to you after you{" "}
                    {gateway.title || "transfer funds"} to:
                  </p>
                  <ul className="mt-3.5 text-sm text-slate-500 dark:text-slate-400 space-y-2">
                    <li>
                      {/* <h3 className="text-base text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      {gateway.title}
                    </h3> */}
                    </li>
                    <li>
                      {gateway.description && (
                        <span className="text-slate-900 dark:text-slate-200 font-medium">
                          <span
                            dangerouslySetInnerHTML={{ __html: gateway.description }}
                          />
                        </span>
                      )}
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )
    );
  };

  const renderPaymentMethod = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <div className="flex flex-row items-center gap-4 md:gap-0">
            <h1 className="h-10 w-10 border-blue-700 text-blue-700 rounded-xl border-2 flex items-center justify-center text-xl font-bold">
              {isBillingAddressEnabled ? "3" : "4"}
            </h1>
            <div className="sm:ml-8">
              <div className=" text-slate-700 items-center dark:text-slate-300 flex ">
                <h3 className="text-lg font-semibold">Payment Method</h3>
              </div>
              <div className=" mt-1 text-sm">
                <span className="">Select Payment Method</span>
                <span className="ml-3 tracking-tighter"></span>
              </div>
            </div>
          </div>
          {!isActive && (
            <ButtonSecondary
              sizeClass="py-2 px-4 sm:w-fit w-full"
              fontSize="text-sm font-medium"
              className="bg-slate-50 dark:bg-slate-800 mt-5 sm:mt-0 sm:ml-auto !rounded-lg"
              onClick={onOpenActive}
            >
              Change
            </ButtonSecondary>
          )}
        </div>

        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-6 ${isActive ? "block" : "hidden"
            }`}
        >
          {/* ==================== */}
          {/* <div>{renderDebitCredit()}</div> */}

          {/* ==================== */}
          <div className="flex flex-col gap-6">

            {/* {paymentGateways?.map((gateway) => (
              gateway.id !== "darazbnpl" && (
                <PaymentMethods key={gateway.id} gateway={gateway} />
              )
            ))} */}

            {paymentGateways
              ?.filter((gateway) => {
                if (isPreOrderCart && (gateway.id === 'darazbnpl' || gateway.id === 'payhere')) return false;
                return true;
              })
              .map((gateway) => (
                <PaymentMethods key={gateway.id} gateway={gateway} />
              ))}
          </div>

          <div className="flex pt-6">
            <ButtonPrimary
              className="w-full max-w-[240px]"
              onClick={() => {
                const paymethod = {
                  selectedGateway,
                };
                updateFormData("paymentMethod", paymethod);
                setIsConfirmed(true);
                onCloseActive();
                handleConfirmationChange(true);
              }}
            >
              Save Payment Method
            </ButtonPrimary>
            <ButtonSecondary className="ml-3" onClick={onCloseActive}>
              Cancel
            </ButtonSecondary>
          </div>
        </div>
      </div>
    );
  };

  return renderPaymentMethod();
};

export default PaymentMethod;
