import { SelectField } from "@/components/global/forms/HelperComps";
import { SRI_LANKAN_PROVINCES } from "@/data/sriLankanProvinces";
import { CustomerAddress } from "@/graphql/types/graphql";
import Label from "@/components/global/primitives/Label/Label";
import { siteConfig } from "@/site.config";
import { BadgeMinus, Check, Receipt } from "lucide-react";
import { FC, useEffect, useState } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import Input from "shared/Input/Input";
import Radio from "shared/Radio/Radio";
import Select from "shared/Select/Select";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  updateFormData: (section: string, data: any) => void;
  initialData: CustomerAddress | null;
  handleConfirmationChange: any;
}

const BillingAddress: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  updateFormData,
  initialData,
  handleConfirmationChange,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("");
  const [addressType, setAddressType] = useState("home");

  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || "");
      setLastName(initialData.lastName || "");
      setAddress(initialData.address1 || "");
      setApartment(initialData.address2 || "");
      setCity(initialData.city || "");
      setState(initialData.state || "");
      setPostal(initialData.postcode || "");
      setCountry(initialData.country || "");
      setAddressType("home");
    }
  }, [initialData]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const billingAddressData = {
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      postal,
      country,
      addressType,
    };
    updateFormData("billingAddress", billingAddressData);
    setIsConfirmed(true);
    onCloseActive();
    handleConfirmationChange(true);
  };

  const renderBillingAddress = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <div className="flex flex-row gap-4 items-center md:gap-0">
            <h1 className="h-10 w-10 border-blue-700 text-blue-700 rounded-xl border-2 flex items-center justify-center text-xl font-bold">
              3
            </h1>
            <div className="sm:ml-8">
              <h3 className=" text-slate-700 items-center dark:text-slate-300 flex ">
                <span className="text-lg font-semibold">Billing Address</span>
              </h3>
              <div className=" mt-1 text-sm">
                <span className="">
                  {initialData?.address1 || "Your Address"}
                </span>
              </div>
            </div>
          </div>
          {isActive && (
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
        <form onSubmit={handleSubmit}>
          <div
            className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-2 sm:space-y-2 ${
              isActive ? "block" : "hidden"
            }`}
          >
            {/* ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <div>
                {/* <Label className="text-sm capitalize ">first name</Label> */}
                <Input
                  className="mt-1.5 capitalize"
                  placeholder="First name*"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                {/* <Label className="text-sm">Last name</Label> */}
                <Input
                  className="mt-1.5 capitalize"
                  placeholder="Last name*"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ============ */}
            <div className="sm:flex space-y-4 sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                {/* <Label className="text-sm">Address</Label> */}
                <Input
                  className="mt-1.5 capitalize"
                  placeholder="Address*"
                  name="address1"
                  value={address}
                  type={"text"}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="sm:w-1/3">
                {/* <Label className="text-sm ">Apt, Suite *</Label> */}
                <Input
                  className="mt-1.5 capitalize"
                  placeholder="Apt, Suite*"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <div>
                {/* <Label className="text-sm   ">City</Label> */}
                <Input
                  className="mt-1.5  normal-case  "
                  placeholder="City*"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                {/* <Label className="text-sm">Country</Label> */}
                <Select
                  value={siteConfig.locale.countryCode}
                  className="mt-1.5 capitalize"
                  placeholder={`Country (e.g., ${siteConfig.locale.countryName})`}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={true}
                >
                  <option value={siteConfig.locale.countryName}>{siteConfig.locale.countryName}</option>
                </Select>
              </div>
            </div>

            {/* ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <SelectField
                // label="State"
                name="state"
                value={state}
                options={SRI_LANKAN_PROVINCES.map((state) => ({
                  value: state,
                  label: state,
                }))}
                onChange={(e: any) => setState(e.target.value)}
              />
              <div>
                {/* <Label className="text-sm">Postal code</Label> */}
                {/* <Input
                  className="mt-1.5 capitalize"
                  placeholder="Postal code*"
                  required
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                /> */}
              </div>
            </div>

            {/* ============ */}
            <div className="flex flex-col sm:flex-row pt-6">
              <ButtonPrimary className="sm:!px-7 shadow-none">
                Save and next to Payment
              </ButtonPrimary>
            </div>
          </div>
        </form>
      </div>
    );
  };
  return renderBillingAddress();
};

export default BillingAddress;
