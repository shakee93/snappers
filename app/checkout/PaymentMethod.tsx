import { FC, useEffect, useState } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import Radio from "shared/Radio/Radio";
import Image from "next/image";

import { Cart, PaymentGateway } from "@/graphql/types/graphql";
import { useCart } from "@/context/CartProvider";
import { GET_PRODUCT } from "@/graphql/defs/products";
import { useQuery } from "@apollo/client";

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

  const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { cart, loading } = useCart();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList[0]) {
      const file = fileList[0];
      setBankSlipFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Store file in formData
      updateFormData("paymentMethod", {
        selectedGateway,
        bankSlipFile: file,
      });
    }
  };

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

  // Check if cart contains pre-order products
  const hasPreOrderProducts = () => {
    try {
      const currentCart = cart;
      if (
        !currentCart ||
        !currentCart.contents ||
        !currentCart.contents.nodes
      ) {
        return false;
      }

      return currentCart.contents.nodes.some((node: any) => {
        const productTags = node.product?.node?.productTags?.nodes || [];
        return productTags.some((tag: any) => tag.slug === 'pre-order');
      });
    } catch (error) {
      console.error("Error while checking for pre-order products:", error);
      return false;
    }
  };

  const isPreOrderCart = hasPreOrderProducts();

  const PaymentMethods: FC<{ gateway: PaymentGateway }> = ({ gateway }) => {
    const active = methodActive === gateway.id;

    let is_tab_or_mobile = hidePayhereForMobileAndTablets ? gateway.id == "payhere" && hidePayhere : false;
    const shouldHidePayhere = gateway.id === 'payhere' && isPriceFluctuation?.topBarPriceFluctuationNotice && totalPayment >= 100000;
    
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

              // Clear bank slip file if switching away from bacs
              if (gateway.id !== "bacs") {
                setBankSlipFile(null);
                setPreviewUrl(null);
                updateFormData("paymentMethod", {
                  selectedGateway: {
                    id: gateway.id,
                    title: gateway.title,
                  },
                  bankSlipFile: null,
                });
              }

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
                  {/* Unique description for Bank Transfer (bacs) */}
                  {gateway.id === "bacs" ? (
                    <div className="space-y-4">
                      <p className="text-sm dark:text-slate-300">
                        Your order will be delivered to you after you transfer the payment to our bank account.
                      </p>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">Bank Details:</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          Bank Name: Commercial Bank<br />
                          Account Name: GQ Mobiles Pvt Ltd<br />
                          Account Number: 1000475584<br />
                          Branch: Head office<br />
                        </p>
                      </div>
                      
                      {/* File Upload Section */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                          Upload Bank Slip <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          id="bank-slip-upload"
                          accept="image/png, image/gif, image/jpeg, image/heic, image/heif, image/webp, image/bmp, image/tiff"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-slate-500 dark:text-slate-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primaryColor file:text-white
                            hover:file:bg-slate-800
                            file:cursor-pointer
                            cursor-pointer"
                        />
                        {previewUrl && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Preview:</p>
                            <div className="relative w-full max-w-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                              <Image
                                src={previewUrl}
                                alt="Bank slip preview"
                                width={400}
                                height={300}
                                className="w-full h-auto object-contain"
                              />
                            </div>
                            {bankSlipFile && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {bankSlipFile.name}
                              </p>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          Please upload your bank transfer slip after completing the payment.
                        </p>
                      </div>
                      
                      {gateway.description && (
                        <div className="text-slate-900 dark:text-slate-200 font-medium">
                          <span
                            dangerouslySetInnerHTML={{ __html: gateway.description }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
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

            {paymentGateways?.map((gateway) => (
              <PaymentMethods key={gateway.id} gateway={gateway} />
            ))}
          </div>

          <div className="flex pt-6">
            <ButtonPrimary
              className={`w-full max-w-[240px] ${
                selectedGateway.id === "bacs" && !bankSlipFile
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={selectedGateway.id === "bacs" && !bankSlipFile}
              onClick={() => {
                // Validate bank slip file for bacs
                if (selectedGateway.id === "bacs" && !bankSlipFile) {
                  alert("Please upload your bank slip before saving the payment method.");
                  return;
                }

                const paymethod = {
                  selectedGateway,
                  bankSlipFile: selectedGateway.id === "bacs" ? bankSlipFile : null,
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
