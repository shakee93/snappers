"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Input from "shared/Input/Input";
import CountryPhoneInput from "./components/CountryPhoneInput";
import Link from "next/link";
import { CustomerAddress, PaymentGateway } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import Select from "shared/Select/Select";
import { toast } from "sonner";
import { SRI_LANKAN_STATES } from "@/components/AddressPageComps/HelperComps";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Radio from "shared/Radio/Radio";
import { useCart } from "@/context/CartProvider";
import { Check } from "lucide-react";

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
    const [methodActive, setMethodActive] = useState<string>("");
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>({
        id: "",
        title: null,
    });

    const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);
    const [pickupType, setPickupType] = useState<"store_uber_pickme" | "courier">("courier");

    const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

    const { cart } = useCart();

    const handleBankSlipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList?.[0]) {
            const file = fileList[0];
            setBankSlipFile(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

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

    // Seed parent with the default delivery method (Courier) on mount
    useEffect(() => {
        setIsStorePickup(false);
        updateFormData("shippingDetails", {
            databaseId: null,
            id: null,
            title: "Courier",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePickupTypeChange = (type: "store_uber_pickme" | "courier") => {
        setPickupType(type);
        const isPickup = type === "store_uber_pickme";
        setIsStorePickup(isPickup);
        if (isPickup) {
            updateFormData("shippingDetails", {
                databaseId: "local_pickup",
                id: "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==",
                title: "Store / Uber / PickMe",
            });
        } else {
            updateFormData("shippingDetails", {
                databaseId: null,
                id: null,
                title: "Courier",
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

    const isPreOrderCart = hasPreOrderProducts();

    const visiblePaymentGateways = useMemo(() => {
        if (!paymentGateways?.length) return [];
        const hidePayhereOnMobile = removePayhereOnMobileAndTab();
        return paymentGateways.filter((gateway) => {
            if (hidePayhereOnMobile && gateway.id === "payhere") {
                return false;
            }
            if (isPreOrderCart && (gateway.id === "darazbnpl" || gateway.id === "payhere")) {
                return false;
            }
            if (
                gateway.id === "payhere" &&
                isPriceFluctuation?.topBarPriceFluctuationNotice &&
                totalPayment >= 100000
            ) {
                return false;
            }
            return true;
        });
    }, [paymentGateways, isPreOrderCart, isPriceFluctuation, totalPayment, cart]);

    useEffect(() => {
        if (!visiblePaymentGateways.length || selectedGateway.id) return;
        const g = visiblePaymentGateways[0];
        setMethodActive(g.id);
        setSelectedGateway({ id: g.id, title: g.title });
        if (g.id === "darazbnpl") {
            setIsKokoPayment(true);
        } else {
            setIsKokoPayment(false);
        }
        if (g.id === "payhere") {
            setIsCardPayment(true);
        } else {
            setIsCardPayment(false);
        }
    }, [visiblePaymentGateways, selectedGateway.id, setIsCardPayment, setIsKokoPayment]);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedGateway.id) {
            toast.error("Please select a payment method.");
            return;
        }

        if (selectedGateway.id === "bacs" && !bankSlipFile) {
            toast.error("Please upload your bank slip before continuing.");
            return;
        }

        setSubmitState("loading");
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

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
            bankSlipFile: selectedGateway.id === "bacs" ? bankSlipFile : null,
        };
        updateFormData("paymentMethod", paymethod);
        handleConfirmationChange("paymentMethod", true);

        await new Promise<void>((r) => setTimeout(r, 400));

        onFormSubmit();
        setSubmitState("success");
        window.setTimeout(() => setSubmitState("idle"), 2500);
    };

    const PaymentMethods = ({ gateway }: { gateway: PaymentGateway }) => {
        const active = methodActive === gateway.id;

        return (
            <div className="flex items-start cursor-pointer space-x-4 sm:space-x-6">
                <Radio
                    className="cursor-pointer"
                    name="payment-method"
                    id={gateway.id}
                    checked={active}
                    onChange={(e) => {
                        setMethodActive(e as any);
                        setSelectedGateway({
                            id: gateway.id,
                            title: gateway.title,
                        });

                        if (gateway.id !== "bacs") {
                            setBankSlipFile(null);
                            if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                                setPreviewUrl(null);
                            }
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
                        <p className="font-medium">
                            {gateway.id === "payhere" ? "Pay Online" : gateway.title}
                        </p>
                    </label>
                    <div className={`mt-6 mb-4 ${active ? "block" : "hidden"}`}>
                        {gateway.id !== "darazbnpl" && (
                            <>
                                {gateway.id === "bacs" ? (
                                    <div className="space-y-4">
                                        <p className="text-sm dark:text-slate-300">
                                            Your order will be delivered to you after you transfer the payment to our bank account.
                                        </p>
                                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                                                Bank Details:
                                            </p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                Bank Name: Commercial Bank
                                                <br />
                                                Account Name: GQ Mobiles Pvt Ltd
                                                <br />
                                                Account Number: 1000475584
                                                <br />
                                                Branch: Head office
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                                                Upload Bank Slip <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="file"
                                                id={`bank-slip-upload-${gateway.id}`}
                                                accept="image/png, image/gif, image/jpeg, image/heic, image/heif, image/webp, image/bmp, image/tiff, application/pdf"
                                                onChange={handleBankSlipChange}
                                                className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primaryColor file:text-white hover:file:bg-slate-800 file:cursor-pointer cursor-pointer"
                                            />
                                            {previewUrl && bankSlipFile && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Preview:</p>
                                                    {bankSlipFile.type.startsWith("image/") ? (
                                                        <div className="relative w-full max-w-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                            <Image
                                                                src={previewUrl}
                                                                alt="Bank slip preview"
                                                                width={400}
                                                                height={300}
                                                                className="w-full h-auto object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">{bankSlipFile.name}</p>
                                                    )}
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{bankSlipFile.name}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                Please upload your bank transfer slip after completing the payment.
                                            </p>
                                        </div>
                                        {gateway.description && (
                                            <div className="text-slate-900 dark:text-slate-200 font-medium text-sm">
                                                <span dangerouslySetInnerHTML={{ __html: gateway.description }} />
                                            </div>
                                        )}
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Make your payment directly into our bank account. Please attach your payment slip to this order. Your order will not be shipped until the funds have cleared in our account.
                                        </p>
                                    </div>
                                ) : (
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
                                Already have an account?{` `}
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
                            <label htmlFor="checkout-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Email address
                            </label>
                            <Input
                                id="checkout-email"
                                placeholder="you@example.com"
                                value={email}
                                type="email"
                                autoComplete="email"
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
                        <div className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                Delivery Method
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pickup"
                                        value="store_uber_pickme"
                                        checked={pickupType === "store_uber_pickme"}
                                        onChange={() => handlePickupTypeChange("store_uber_pickme")}
                                        className="w-4 h-4 text-primaryColor border-gray-300 focus:ring-primaryColor focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                        Store / Uber / PickMe
                                    </span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pickup"
                                        value="courier"
                                        checked={pickupType === "courier"}
                                        onChange={() => handlePickupTypeChange("courier")}
                                        className="w-4 h-4 text-primaryColor border-gray-300 focus:ring-primaryColor focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                        Courier
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="checkout-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Full name
                            </label>
                            <Input
                                id="checkout-name"
                                className="capitalize"
                                value={firstName}
                                placeholder="e.g. Amila Perera"
                                autoComplete="name"
                                onChange={(e) => setFirstName(e.target.value)}
                                required={true}
                            />
                        </div>

                        {pickupType === "courier" ? (
                            <>
                                <div className="sm:flex sm:space-x-3 sm:space-y-0 space-y-4">
                                    <div className="flex-1">
                                        <label htmlFor="checkout-address1" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Address line 1
                                        </label>
                                        <Input
                                            id="checkout-address1"
                                            className="capitalize"
                                            placeholder="Street address"
                                            name="address1"
                                            value={address}
                                            type="text"
                                            autoComplete="address-line1"
                                            onChange={(e) => setAddress(e.target.value)}
                                            required={true}
                                        />
                                    </div>
                                    <div className="sm:w-1/3">
                                        <label htmlFor="checkout-address2" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Address line 2 <span className="text-slate-400 font-normal">(optional)</span>
                                        </label>
                                        <Input
                                            id="checkout-address2"
                                            className="capitalize"
                                            placeholder="Apartment, suite, etc."
                                            name="address2"
                                            value={apartment}
                                            autoComplete="address-line2"
                                            onChange={(e) => setApartment(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
                                    <div>
                                        <label htmlFor="checkout-city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            City
                                        </label>
                                        <Input
                                            id="checkout-city"
                                            className="normal-case"
                                            placeholder="e.g. Colombo"
                                            value={city}
                                            autoComplete="address-level2"
                                            onChange={(e) => setCity(e.target.value)}
                                            required={true}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Province
                                        </label>
                                        <Select
                                            id="checkout-state"
                                            name="state"
                                            value={state || ""}
                                            onChange={(e) => setState(e.target.value)}
                                            required={true}
                                        >
                                            <option value="" disabled>Select province</option>
                                            {SRI_LANKAN_STATES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300">
                                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                                    Ready for pickup from our store
                                </p>
                                <p>
                                    We&apos;ll notify you on the phone number above when your order is ready. You can collect in-store or arrange an Uber / PickMe from our location.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Method Section */}
            <div className="overflow-hidden">
                <div className="p-0">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

                    <div className="space-y-6">
                        {visiblePaymentGateways.map((gateway) => (
                            <PaymentMethods key={gateway.id} gateway={gateway} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-2 pt-6">
                <ButtonPrimary
                    type="submit"
                    className="sm:!px-7 shadow-none min-w-[200px]"
                    loading={submitState === "loading"}
                    disabled={submitState === "success"}
                >
                    {submitState === "success" ? (
                        <span className="inline-flex items-center justify-center gap-2">
                            <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} aria-hidden />
                            Saved successfully
                        </span>
                    ) : (
                        "Save and Continue"
                    )}
                </ButtonPrimary>
            </div>
        </form>
    );
};

export default UnifiedCheckoutForm;

