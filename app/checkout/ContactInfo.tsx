import { contactInformation } from "@/data/types";
import Label from "components/Label/Label";
import React, { FC, useEffect, useState } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import Checkbox from "shared/Checkbox/Checkbox";
import Input from "shared/Input/Input";
import { BadgeMinus, Check } from "lucide-react";

interface Props {
  isActive: boolean;
  onOpenActive: () => void;
  onCloseActive: () => void;
  updateFormData: (section: string, data: any) => void;
  initialData: contactInformation;
  handleConfirmationChange: any;
}

const ContactInfo: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  updateFormData,
  initialData,
  handleConfirmationChange,
}) => {
  const [phone, setPhone] = useState("+94");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPhone(initialData?.phone);
      setEmail(initialData?.email);
      setDisplayName(initialData?.displayName);
    }
  }, [initialData]);

  const handleContactSubmit = (e: any) => {
    e.preventDefault();
    if (phone && email) {
      const contactInfo = {
        phone,
        email,
      };
      updateFormData("contactInfo", contactInfo);
      setPhone(initialData?.phone);
      setEmail(initialData?.email);
      setIsConfirmed(true);
      onCloseActive();
      handleConfirmationChange(true);
    } else {
      setIsConfirmed(false);
    }
  };

  const renderAccount = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-0">
        <div className="flex flex-col sm:flex-row items-start p-6 ">
          <h1 className="text-2xl self-center  font-semibold">1</h1>
          <div className="sm:ml-8">
            <h3 className=" text-slate-700 items-center dark:text-slate-300 flex ">
              <span className="uppercase tracking-tight">CONTACT INFO*</span>
            </h3>
            <div className="font-semibold mt-1 text-sm">
              <span className="">{email ?? ""}</span>
              <span className="ml-3 tracking-tighter">{phone || ""}</span>
            </div>
          </div>
          <ButtonSecondary
            sizeClass="py-2 px-4 "
            fontSize="text-sm font-medium"
            className="bg-slate-50 dark:bg-slate-800 mt-5 sm:mt-0 sm:ml-auto !rounded-lg"
            onClick={() => onOpenActive()}
          >
            Change
          </ButtonSecondary>
        </div>
        <form onSubmit={handleContactSubmit}>
          <div
            className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-4 sm:space-y-6 ${
              isActive ? "block" : "hidden"
            }`}
          >
            <div className="flex justify-between flex-wrap items-baseline">
              <h3 className="text-lg font-semibold">Contact infomation</h3>

              {!initialData?.displayName && (
                <span className="block text-sm my-1 md:my-0">
                  Do not have an account?{` `}
                  <a href="##" className="text-primary-500 font-medium">
                    Log in
                  </a>
                </span>
              )}
            </div>
            <div className="max-w-lg">
              <Label className="text-sm">Your phone number</Label>
              <Input
                className="mt-1.5"
                value={phone}
                type="tel"
                onChange={(e) => setPhone(e.target.value)}
                required={true}
              />
            </div>
            <div className="max-w-lg">
              <Label className="text-sm">Email address</Label>
              <Input
                className="mt-1.5"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                required={true}
              />
            </div>

            {/* ============ */}
            <div className="flex flex-col sm:flex-row pt-6">
              <ButtonPrimary type="submit" className="sm:!px-7 shadow-none">
                Save and next to Shipping
              </ButtonPrimary>
            </div>
          </div>
        </form>
      </div>
    );
  };

  return renderAccount();
};

export default ContactInfo;
