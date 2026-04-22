import { contactInformation } from "@/data/types";
import Label from "components/Label/Label";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Input from "shared/Input/Input";
import CountryPhoneInput, { countries } from "./components/CountryPhoneInput";

interface Props {
  isActive: boolean;
  onOpenActive: () => void;
  onCloseActive: () => void;
  updateFormData: (section: string, data: any) => void;
  formData: FormData;
  initialData: contactInformation;
  handleConfirmationChange: any;
}

const ContactInfo = ({
  isActive,
  onCloseActive,
  onOpenActive,
  updateFormData,
  formData,
  initialData,
  handleConfirmationChange,
}: Props) => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("LK");
  const [isConfirmed, setIsConfirmed] = useState(false);



  useEffect(() => {
    if (initialData) {
      setPhone(initialData?.phone);
      setEmail(initialData?.email);
      setDisplayName(initialData?.displayName);
      setCountry(initialData?.country || "LK");
    }
  }, [initialData]);

  const handleContactSubmit = (e: any) => {
    e.preventDefault();
    if (phone && email) {
      const contactInfo = {
        phone,
        email,
        country,
      };
      updateFormData("contactInfo", contactInfo);
      setIsConfirmed(true);
      onCloseActive();
      handleConfirmationChange(true);
    } else {
      setIsConfirmed(false);
    }
  };

  const renderAccount = () => {
    return (
      <>
      <div>
        <h3 className="text-lg font-semibold">Contact infomation</h3>
        <form onSubmit={handleContactSubmit}>
          <div className="py-4 space-y-2 sm:space-y-2">
            <div className="flex justify-between flex-wrap items-baseline">
              {!initialData?.displayName && (
                <span className="block text-sm my-1 md:my-0">
                  Do not have an account?{` `}
                  <Link href="/login" className="text-primary-500 font-medium">
                    Log in
                  </Link>
                </span>
              )}
            </div>
            <div className="max-w-lg">
              {/* <Label className="text-sm">Country & Phone</Label> */}
              <CountryPhoneInput
                country={country}
                phone={phone}
                onCountryChange={setCountry}
                onPhoneChange={setPhone}
              />
            </div>
            <div className="max-w-lg">
              {/* <Label className="text-sm">Email address</Label> */}
              <Input
                placeholder="Email*"
                className="mt-2"
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
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-0">
        <div className="flex flex-col sm:flex-row items-start p-6 ">
          <div className="flex flex-row items-center gap-4 md:gap-0 flex-1">
            <div className="sm:ml-8 flex-1">
              <div className=" text-slate-700 items-center dark:text-slate-300 flex ">
                <h3 className="text-lg font-semibold">Contact infomation</h3>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      </>
    );
  };

  return renderAccount();
};

export default ContactInfo;
