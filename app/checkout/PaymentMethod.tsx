import Label from "components/Label/Label";
import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import Input from "shared/Input/Input";
import Radio from "shared/Radio/Radio";
import {PaymentGateway} from "@/graphql/types/graphql";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  updateFormData: (section: string, data: any) => void;
  paymentGateways: PaymentGateway[]
}


const PaymentMethod: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  paymentGateways,
  updateFormData,
}) => {

  const [methodActive, setMethodActive] = useState<
    "Credit-Card" | "Internet-banking" | "Wallet"
  >("Credit-Card");

  useEffect(() => {
  }, [paymentGateways]);

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>({
    id: "",
    title: null,
  });

  const [isConfirmed, setIsConfirmed] = useState(false);

  const PaymentMethods = (gateway: PaymentGateway) => {

    const active = methodActive === gateway.id;

    return (
      <div className="flex items-start space-x-4 sm:space-x-6">
        <Radio
          className="pt-3.5"
          name="payment-method"
          id={gateway.id}
          defaultChecked={active}
          onChange={(e) => {
            setMethodActive(e as any);
            setSelectedGateway({
              id: gateway.id,
              title: gateway.title,
            });
          }}
        />
        <div className="flex-1">
          <label
            htmlFor={gateway.id}
            className="flex items-center space-x-4 sm:space-x-6"
          >
            <div
              className={`p-2.5 rounded-xl border-2 ${active
                ? "border-slate-600 dark:border-slate-300"
                : "border-gray-200 dark:border-slate-600"
                }`}
            >
              {/* Use gateway-specific icon or default */}
              {gateway.icon ? (
                <img
                  src={gateway.icon}
                  alt={`${gateway.title} Icon`}
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
              ) : (
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Default SVG paths here */}
                </svg>
              )}
            </div>
            <p className="font-medium">{gateway.title}</p>
          </label>
          <div className={`mt-6 mb-4 ${active ? "block" : "hidden"}`}>
            <p className="text-sm dark:text-slate-300">
              Your order will be delivered to you after you {gateway.title || 'transfer funds'} to:
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
                    <span dangerouslySetInnerHTML={{ __html: gateway.description }} />
                  </span>
                )}
              
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };


  const renderPaymentMethod = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <span className="hidden sm:block">
            <svg
              className="w-6 h-6 text-slate-700 dark:text-slate-400 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.92969 15.8792L15.8797 3.9292"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.1013 18.2791L12.3013 17.0791"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.793 15.5887L16.183 13.1987"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.60127 10.239L10.2413 3.599C12.3613 1.479 13.4213 1.469 15.5213 3.569L20.4313 8.479C22.5313 10.579 22.5213 11.639 20.4013 13.759L13.7613 20.399C11.6413 22.519 10.5813 22.529 8.48127 20.429L3.57127 15.519C1.47127 13.419 1.47127 12.369 3.60127 10.239Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 21.9985H22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="sm:ml-8">
            <h3 className=" text-slate-700 dark:text-slate-400 flex ">
              <span className="uppercase tracking-tight">PAYMENT METHOD</span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5 ml-3 text-slate-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </h3>
            <div className="font-semibold mt-1 text-sm">
              <span className="">Google / Apple Wallet</span>
              <span className="ml-3">xxx-xxx-xx55</span>
            </div>
          </div>
          <ButtonSecondary
            sizeClass="py-2 px-4 "
            fontSize="text-sm font-medium"
            className="bg-slate-50 dark:bg-slate-800 mt-5 sm:mt-0 sm:ml-auto !rounded-lg"
            onClick={onOpenActive}
          >
            Change
          </ButtonSecondary>
        </div>

        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-6 ${isActive ? "block" : "hidden"
            }`}
        >
          {/* ==================== */}
          {/* <div>{renderDebitCredit()}</div> */}

          {/* ==================== */}
          <div className="flex flex-col gap-6">
            {paymentGateways?.map((gateway) => PaymentMethods(gateway))}
          </div>

          <div className="flex pt-6">
            <ButtonPrimary
              className="w-full max-w-[240px]"
              onClick={() => {
                const paymethod = {
                  selectedGateway
                };
                updateFormData("paymentMethod", paymethod);
                setIsConfirmed(true);
                onCloseActive();
              }}
            >
              Confirm order
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
