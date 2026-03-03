"use client";

import { useEffect, useState } from "react";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Input from "shared/Input/Input";
import CountryPhoneInput from "./components/CountryPhoneInput";
import Link from "next/link";
import { CustomerAddress, PaymentGateway } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import Select from "shared/Select/Select";
import {
    SelectField,
    SRI_LANKAN_STATES,
} from "@/components/AddressPageComps/HelperComps";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Radio from "shared/Radio/Radio";
import { useCart } from "@/context/CartProvider";

interface Props {
    updateFormData: (section: string, data: any) => void;
    formData: any;
    initialContactData: contactInformation;
    initialShippingData: CustomerAddress | null;
    paymentGateways: PaymentGateway[];
    handleConfirmationChange: any;
    setIsStorePickup: any;
    isStorePickup: boolean;
    setIsCardPayment: any;
    isCardPayment: boolean;
    totalPayment: number;
    setIsKokoPayment: any;
    isKokoPayment: boolean;
    isPriceFluctuation: any;
    onFormSubmit: () => void;
}

const UnifiedCheckoutForm = ({
    updateFormData,
    formData,
    initialContactData,
    initialShippingData,
    paymentGateways,
    handleConfirmationChange,
    setIsStorePickup,
    isStorePickup,
    setIsCardPayment,
    isCardPayment,
    totalPayment,
    setIsKokoPayment,
    isKokoPayment,
    isPriceFluctuation,
    onFormSubmit,
}: Props) => {
    // Contact Info State
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [country, setCountry] = useState("LK");

    // Delivery Address State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postal, setPostal] = useState("");
    const [addressCountry, setAddressCountry] = useState("");
    const [addressType, setAddressType] = useState("home");

    // Payment Method State
    const [methodActive, setMethodActive] = useState<string>("Credit-Card");
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>({
        id: "",
        title: null,
    });

    const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);

    const { cart } = useCart();

    // Initialize Contact Info
    useEffect(() => {
        if (initialContactData) {
            setPhone(initialContactData?.phone || "");
            setEmail(initialContactData?.email || "");
            setCountry(initialContactData?.country || "LK");
        }
    }, [initialContactData]);

    // Initialize Shipping Address
    useEffect(() => {
        if (initialShippingData) {
            setFirstName(initialShippingData.firstName || "");
            setLastName(initialShippingData.lastName || "");
            setAddress(initialShippingData.address1 || "");
            setApartment(initialShippingData.address2 || "");
            setCity(initialShippingData.city || "");
            setState(initialShippingData.state || "");
            setPostal(initialShippingData.postcode || "");
            setAddressCountry(initialShippingData.country || "");
            setAddressType("home");
        }
    }, [initialShippingData]);

    const handleStorePickupChange = () => {
        if (!isStorePickup) {
            setIsStorePickup(true);
            updateFormData("shippingDetails", {
                databaseId: "local_pickup",
                id: "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==",
                title: "StorePickup",
            });
        } else {
            setIsStorePickup(false);
            updateFormData("shippingDetails", {
                databaseId: null,
                id: null,
                title: null,
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
                return false;
            }

            const categoryNames = currentCart.contents.nodes
                .map(
                    (node: any) => node.product?.node?.productCategories?.nodes[0]?.name
                )
                .filter(Boolean);

            const containsMobileOrTablet = categoryNames.some(
                (name: string) =>
                    name === "Smartphones" ||
                    name === "Tablets" ||
                    name === "1. Mobiles & Tablets"
            );

            return containsMobileOrTablet;
        } catch (error) {
            console.error("Error while processing cart:", error);
            return false;
        }
    };

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

    const hidePayhere = removePayhereOnMobileAndTab();
    const isPreOrderCart = hasPreOrderProducts();

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Update Contact Info
        const contactInfo = {
            phone,
            email,
            country,
        };
        updateFormData("contactInfo", contactInfo);
        handleConfirmationChange("contactInfo", true);

        // Update Delivery Address
        const shippingAddressData = {
            firstName,
            lastName,
            address,
            apartment,
            city,
            state,
            postal,
            country: addressCountry,
            addressType,
        };

        updateFormData("deliveryAddress", shippingAddressData);
        handleConfirmationChange("deliveryAddress", true);

        if (isStorePickup || isBillingSameAsShipping) {
            updateFormData("billingAddress", shippingAddressData);
            handleConfirmationChange("billingAddress", true);
        }

        if (isStorePickup) {
            updateFormData("shippingDetails", {
                databaseId: "local_pickup",
                id: "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==",
                title: "StorePickup",
            });
        }

        // Update Payment Method
        const paymethod = {
            selectedGateway,
        };
        updateFormData("paymentMethod", paymethod);
        handleConfirmationChange("paymentMethod", true);

        // Call parent form submit handler
        onFormSubmit();
    };

    const PaymentMethods = ({ gateway }: { gateway: PaymentGateway }) => {
        const active = methodActive === gateway.id;
        const shouldHidePayhere =
            gateway.id === "payhere" &&
            isPriceFluctuation?.topBarPriceFluctuationNotice &&
            totalPayment >= 100000;
        const shouldHideForPreOrder =
            isPreOrderCart && (gateway.id === "darazbnpl" || gateway.id === "payhere");

        if (shouldHidePayhere || shouldHideForPreOrder) {
            return null;
        }

        return (
            <div className="flex items-start cursor-pointer space-x-4 sm:space-x-6">
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
                        <p className="font-medium">
                            {gateway.id === "payhere" ? "Pay Online" : gateway.title}
                        </p>
                    </label>
                    <div className={`mt-6 mb-4 ${active ? "block" : "hidden"}`}>
                        {gateway.id !== "darazbnpl" && (
                            <>
                                <p className="text-sm dark:text-slate-300">
                                    Your order will be delivered to you after you{" "}
                                    {gateway.title || "transfer funds"} to:
                                </p>
                                <ul className="mt-3.5 text-sm text-slate-500 dark:text-slate-400 space-y-2">
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
        );
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* Contact Information Section */}
            <div className=" overflow-hidden">
                <div className="p-0">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

                    <div className="space-y-4">
                        {!initialContactData?.displayName && (
                            <span className="block text-sm">
                                Do not have an account?{` `}
                                <Link href="/login" className="text-primary-500 font-medium">
                                    Log in
                                </Link>
                            </span>
                        )}

                        <div className="w-full">
                            <CountryPhoneInput
                                country={country}
                                phone={phone}
                                onCountryChange={setCountry}
                                onPhoneChange={setPhone}
                            />
                        </div>

                        <div className="max-w-full">
                            <Input
                                placeholder="Email*"
                                className="mt-2"
                                value={email}
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                required={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping Address Section */}
            <div className=" overflow-hidden">
                <div className="p-0">
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>

                    <div className="space-y-4">
                        <div className="w-fit border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <Checkbox
                                label="Store Pickup"
                                name="store pickup"
                                defaultChecked={isStorePickup}
                                onChange={handleStorePickupChange}
                            />
                        </div>

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
                        </div>

                        <div className="sm:flex sm:space-x-3">
                            <div className="flex-1">
                                <Input
                                    className="mt-1.5 capitalize"
                                    placeholder="Address Line 1*"
                                    name="address1"
                                    value={address}
                                    type="text"
                                    onChange={(e) => setAddress(e.target.value)}
                                    required={true}
                                />
                            </div>
                            <div className="sm:w-1/3">
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

                        <div className="grid grid-cols-1 mt-0 sm:grid-cols-2 gap-0 sm:gap-3">
                            <div>
                                <Input
                                    className="sm:mt-1.5 mt-0 normal-case"
                                    placeholder="Address Line 3"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required={false}
                                />
                            </div>
                            <div>
                                <Select
                                    value="LK"
                                    className="mt-1.5 capitalize"
                                    placeholder="Country (e.g., Sri Lanka)*"
                                    onChange={(e) => setAddressCountry(e.target.value)}
                                    disabled={true}
                                >
                                    <option value="Sri Lanka">Sri Lanka</option>
                                </Select>
                            </div>
                            <div>
                                <SelectField
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
                    </div>
                </div>
            </div>

            {/* Payment Method Section */}
            <div className="overflow-hidden">
                <div className="p-0">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

                    <div className="space-y-6">
                        {paymentGateways
                            ?.filter((gateway) => {
                                if (isPreOrderCart && (gateway.id === 'darazbnpl' || gateway.id === 'payhere')) return false;
                                return true;
                            })
                            .map((gateway) => (
                                <PaymentMethods key={gateway.id} gateway={gateway} />
                            ))}
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex pt-6">
                <ButtonPrimary type="submit" className="sm:!px-7 shadow-none">
                    Continue to Review Order
                </ButtonPrimary>
            </div>
        </form>
    );
};

export default UnifiedCheckoutForm;

