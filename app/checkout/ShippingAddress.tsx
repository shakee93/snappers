import { SRI_LANKAN_STATES, SelectField } from "@/components/AddressPageComps/HelperComps";
import { CustomerAddress } from "@/graphql/types/graphql";
import Label from "components/Label/Label";
import React, { FC, useEffect, useState } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import Input from "shared/Input/Input";
import Select from "shared/Select/Select";
import Checkbox from "@/shared/Checkbox/Checkbox";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  updateFormData: (section: string, data: any) => void;
  initialData: CustomerAddress | null;
  formData: any;
  handleConfirmationChange: any;
  updateBillingVisibility: (isVisible: boolean) => void;
}

const ShippingAddress: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  updateFormData,
  initialData,
  formData,
  handleConfirmationChange,
  updateBillingVisibility
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

  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);
  const [isStorePickup, setIsStorePickup] = useState(true);

  const handleCheckboxChange = () => {
    setIsBillingSameAsShipping((prevValue) => {
      const newValue = !prevValue;

      if (newValue) {
        updateFormData("billingAddress", formData.shippingAddress);
        handleConfirmationChange("billingAddress", true);
        updateBillingVisibility(true);
      } else {
        updateFormData("billingAddress", {});
        handleConfirmationChange("billingAddress", false);
        updateBillingVisibility(false);
      }

      return newValue;
    });
  };

  const handleStorePickupChange = () => {
    setIsStorePickup((prevValue) => {
      const storepickupValue = !prevValue;

      if (storepickupValue) {
        updateFormData("shippingAddress", formData.billingAddress);
        updateFormData("shippingDetails",
          { "databaseId": "local_pickup", "id": "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==", "title": "StorePickup" }
        )
      } else {
        updateFormData("shippingAddress", {});
        updateFormData("shippingDetails",
          { "databaseId": null, "id": null, "title": null });
      }

      // onStorePickupChange(storepickupValue);
      return storepickupValue;
    });
  }

  useEffect(() => {
    if (initialData) {
      console.log("initalData: ", initialData);
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

  useEffect(() => {
    // console.log("main Form Data: ", formData);
    // get the length of the formData
    const isShippingAddressEmpty =
      formData?.shippingAddress &&
      Object.keys(formData?.shippingAddress).length === 0;

    if (isShippingAddressEmpty) {
      setIsConfirmed(false);
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const shippingAddressData = {
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
    updateFormData("shippingAddress", shippingAddressData);
    setIsConfirmed(true);
    onCloseActive();
    handleConfirmationChange(true);
  };

  const renderShippingAddress = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <h1 className="text-2xl self-center  font-semibold">3</h1>
          <div className="sm:ml-8">
            <h3 className=" text-slate-700 items-center gap-2 dark:text-slate-300 flex ">
              <span className="uppercase">DELIVERY ADDRESS*</span>
            </h3>
            <div className="font-semibold mt-1 text-sm">
              <span className="">{address || "Your Delivery Address"}</span>
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
        <form onSubmit={handleSubmit}>
          <div
            className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-4 sm:space-y-6 ${isActive ? "block" : "hidden"
              }`}
          >
            {/* ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <div>
                <Label className="text-sm capitalize ">first name</Label>
                <Input
                  className="mt-1.5 capitalize"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={true}
                />
              </div>
              <div>
                <Label className="text-sm">Last name</Label>
                <Input
                  className="mt-1.5 capitalize"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={true}
                />
              </div>
            </div>

            {/* ============ */}
            <div className="sm:flex space-y-4 sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                <Label className="text-sm">Address</Label>
                <Input
                  className="mt-1.5 capitalize"
                  placeholder=""
                  name="address1"
                  value={address}
                  type={"text"}
                  onChange={(e) => setAddress(e.target.value)}
                  required={true}
                />
              </div>
              <div className="sm:w-1/3">
                <Label className="text-sm ">Apt, Suite *</Label>
                <Input
                  className="mt-1.5 capitalize"
                  name="address2"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  required={true}
                />
              </div>
            </div>

            {/* ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <div>
                <Label className="text-sm   ">City</Label>
                <Input
                  className="mt-1.5  normal-case  "
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required={true}
                />
              </div>
              <div>
                <Label className="text-sm">Country</Label>
                <Select
                  value="LK"
                  className="mt-1.5 capitalize"
                  placeholder="SRI LANKA"
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={true}
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                </Select>
              </div>
            </div>

            {/* ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              <SelectField
                label="State"
                name="state"
                value={state}
                options={SRI_LANKAN_STATES.map((state) => ({
                  value: state,
                  label: state,
                }))}
                onChange={(e: any) => setState(e.target.value)}
              />
              <div>
                <Label className="text-sm">Postal code</Label>
                <Input
                  className="mt-1.5 capitalize"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  required={true}
                />
              </div>
            </div>

            {/* ============ */}
            <div className="flex flex-col sm:flex-row pt-6">
              <ButtonPrimary className="sm:!px-7 shadow-none" type="submit">
                Save and next to Payment
              </ButtonPrimary>
            </div>

            <div className="flex justify-between">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <Checkbox
                  label=" Shipping address is the same as billing address"
                  name="checkbox"
                  defaultChecked={isBillingSameAsShipping}
                  onChange={handleCheckboxChange}
                  className=""
                />
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <Checkbox
                  label="Store Pickup"
                  name="checkbox"
                  defaultChecked={isStorePickup}
                  onChange={handleStorePickupChange}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };
  return renderShippingAddress();
};

export default ShippingAddress;
