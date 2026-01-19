import {
  SelectField,
  SRI_LANKAN_STATES,
} from "@/components/AddressPageComps/HelperComps";
import { CustomerAddress } from "@/graphql/types/graphql";
import { FC, useEffect, useState } from "react";
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
  isStorePickup: boolean;
  toggleConfirmationBillingAddress: any;
  setStorePickup: any;
  setDeliveryAddress: any;
  pickupType: "store" | "uber" | "pickme" | null;
  setPickupType: (type: "store" | "uber" | "pickme" | null) => void;
}

const DeliveryAddress: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  updateFormData,
  initialData,
  formData,
  handleConfirmationChange,
  toggleConfirmationBillingAddress,
  isStorePickup,
  setStorePickup,
  setDeliveryAddress,
  pickupType,
  setPickupType,
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

  useEffect(() => { }, []);
  const handleDeliverySame = () => {
    setIsBillingSameAsShipping((prevValue) => {
      const newValue = !prevValue;

      if (newValue) {
        updateFormData("billingAddress", formData.billingAddress);
        setDeliveryAddress(true);
      } else {
        setDeliveryAddress(false);
        updateFormData("billingAddress", {});
      }

      return newValue;
    });
  };

  const handlePickupTypeChange = (type: "store" | "uber" | "pickme" | null) => {
    if (pickupType === type) {
      // If clicking the same option, deselect it
      setPickupType(null);
      setStorePickup(false);
      updateFormData("shippingDetails", {
        databaseId: null,
        id: null,
        title: null,
      });
    } else {
      if (type === null) {
        return; // Safety check - shouldn't happen but TypeScript needs it
      }
      setPickupType(type);
      setStorePickup(true);
      updateFormData("billingAddress", formData.BillingAddress);
      const pickupTitles = {
        store: "StorePickup",
        uber: "Uber",
        pickme: "PickMe",
      };
      updateFormData("shippingDetails", {
        databaseId: "local_pickup",
        id: "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==",
        title: pickupTitles[type],
      });
    }
  };

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

  // useEffect(() => {
  //   const isShippingAddressEmpty =
  //     formData?.shippingAddress &&
  //     Object.keys(formData?.shippingAddress).length === 0;

  //   if (isShippingAddressEmpty) {
  //     setIsConfirmed(false);
  //   }
  // }, [formData]);

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

    if (pickupType) {
      updateFormData("deliveryAddress", shippingAddressData);
      updateFormData("billingAddress", shippingAddressData);
    } else {
      updateFormData("deliveryAddress", shippingAddressData);
    }
    setIsConfirmed(true);
    onCloseActive();
    handleConfirmationChange(true);
    if (isBillingSameAsShipping) {
      updateFormData("billingAddress", shippingAddressData);
      toggleConfirmationBillingAddress(true);
    }
    if (pickupType) {
      const pickupTitles: Record<"store" | "uber" | "pickme", string> = {
        store: "StorePickup",
        uber: "Uber",
        pickme: "PickMe",
      };
      updateFormData("shippingDetails", {
        databaseId: "local_pickup",
        id: "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==",
        title: pickupTitles[pickupType],
      });
    }
  };

  const renderShippingAddress = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <div className="flex flex-row items-center gap-4 md:gap-0">
            <h1
              className="h-10
             w-10
             border-blue-700 text-blue-700 rounded-xl border-2 flex items-center justify-center text-xl font-bold"
            >
              2
            </h1>
            <div className="sm:ml-8">
              <h3 className=" text-slate-700 items-center gap-2 dark:text-slate-300 flex ">
                <span className="text-lg font-semibold">Shipping Address</span>
              </h3>
              <div className=" mt-1 text-sm">
                <span className="">Your Shipping Address</span>
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
        <form onSubmit={handleSubmit}>
          <div
            className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-2 sm:space-y-2 ${isActive ? "block" : "hidden"
              }`}
          >
            <div className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Pickup
              </h4>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pickup"
                    value="store"
                    checked={pickupType === "store"}
                    onChange={() => handlePickupTypeChange("store")}
                    className="w-4 h-4 text-primaryColor border-gray-300 focus:ring-primaryColor focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    Store
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pickup"
                    value="uber"
                    checked={pickupType === "uber"}
                    onChange={() => handlePickupTypeChange("uber")}
                    className="w-4 h-4 text-primaryColor border-gray-300 focus:ring-primaryColor focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    Uber
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="pickup"
                    value="pickme"
                    checked={pickupType === "pickme"}
                    onChange={() => handlePickupTypeChange("pickme")}
                    className="w-4 h-4 text-primaryColor border-gray-300 focus:ring-primaryColor focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    Pick Me
                  </span>
                </label>
              </div>
            </div>
            {/* ============ */}
            <div className="grid md:grid-cols-1 sm:grid-cols-2 sm:gap-3">
              <div className="w-full">
                <Input
                  className="mt-1.5 capitalize"
                  value={firstName}
                  placeholder="Name*"
                  onChange={(e) => setFirstName(e.target.value)}
                  required={true}
                />
              </div>
              {/* <div>
                <Input
                  className="mt-1.5 capitalize"
                  value={lastName}
                  placeholder="Last name*"
                  onChange={(e) => setLastName(e.target.value)}
                  required={false}
                />
              </div> */}
            </div>

            {/* ============ */}
            <div className="sm:flex  sm:space-x-3">
              <div className="flex-1">
                {/* <Label className="text-sm">Address</Label> */}
                <Input
                  className="mt-1.5 capitalize"
                  placeholder="Address Line 1*"
                  name="address1"
                  value={address}
                  type={"text"}
                  onChange={(e) => setAddress(e.target.value)}
                  required={true}
                />
              </div>
              <div className="sm:w-1/3">
                {/* <Label className="text-sm ">Apt, Suite *</Label> */}
                <Input
                  className="mt-1.5 capitalize"
                  placeholder="Address Line 2*"
                  name="address2"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  required={true}
                />
              </div>
            </div>

            {/* ============ */}
            <div className="grid grid-cols-1 mt-0 sm:grid-cols-2 gap-0  sm:gap-3">
              <div>
                <Input
                  className=" sm:mt-1.5 mt-0 normal-case  "
                  placeholder="Address Line 3"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required={false}
                />
              </div>
              <div>
                {/* <Label className="text-sm">Country</Label> */}
                <Select
                  value="LK"
                  className="mt-1.5 capitalize"
                  placeholder="Country (e.g., Sri Lanka)*"
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={true}
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                </Select>
              </div>
              <div>
                <SelectField
                  // label="State"
                  sizeClass="mt-0 sm:mt-1.5"
                  className="mt-0 sm:mt-1.5"
                  name="state"
                  value={state}
                  options={SRI_LANKAN_STATES.map((state) => ({
                    value: state,
                    label: state,
                  }))}
                  onChange={(e: any) => setState(e.target.value)}
                />
              </div>
            </div>

            {/* ============ */}
            <div className="grid grid-cols-1 mt-0 sm:grid-cols-2  sm:gap-3">

              <div>
                {/* <Label className="text-sm">Postal code</Label> */}
                {/* <Input
                  className="mt-1.5 capitalize"
                  placeholder="Postal code*"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  required={true}
                /> */}
              </div>
            </div>

            {/* ============ */}
            <div className="flex flex-col sm:flex-row pt-6">
              <ButtonPrimary className="sm:!px-7 shadow-none" type="submit">
                {!isBillingSameAsShipping
                  ? "Save and Proceed to Billing"
                  : "Save and Proceed to Payment"}
              </ButtonPrimary>
            </div>

            {/* {!isStorePickup && (
              <div className="flex justify-between gap-4">
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <Checkbox
                    key={2}
                    label="Delivery address is the same as billing address"
                    name="deliverySame"
                    defaultChecked={isBillingSameAsShipping}
                    onChange={handleDeliverySame}
                  />
                </div>
              </div>
            )} */}
          </div>
        </form>
      </div>
    );
  };
  return renderShippingAddress();
};

export default DeliveryAddress;
