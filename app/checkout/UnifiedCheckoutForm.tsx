"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Input from "shared/Input/Input";
import CountryPhoneInput from "./components/CountryPhoneInput";
import Link from "next/link";
import { CustomerAddress, PaymentGateway } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import Select from "shared/Select/Select";
import { toast } from "sonner";
import { SRI_LANKAN_STATES } from "@/components/AddressPageComps/HelperComps";
import { useCart } from "@/context/CartProvider";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import PreOrderNotice from "@/components/PreOrderNotice";
import {
    Store,
    Truck,
    CreditCard,
    Banknote,
    Landmark,
    Check,
    ChevronRight,
    ArrowLeft,
    Loader,
} from "lucide-react";

export interface CheckoutSubmitPayload {
    contactInfo: { phone: string; email: string; country: string };
    deliveryAddress: {
        firstName: string;
        lastName: string;
        address: string;
        apartment: string;
        city: string;
        state: string;
        postal: string;
        country: string;
        addressType: string;
    };
    billingAddress: {
        firstName: string;
        lastName: string;
        address: string;
        apartment: string;
        city: string;
        state: string;
        postal: string;
        country: string;
        addressType: string;
    };
    paymentMethod: {
        selectedGateway: { id: string; title: string | null };
        bankSlipFile: File | null;
    };
    isStorePickup: boolean;
}

type StepKey = "details" | "payment" | "review";

interface CheckoutStepperProps {
    currentStep: StepKey;
}

const STEP_ORDER: StepKey[] = ["details", "payment", "review"];
const STEP_LABELS: Record<StepKey, string> = {
    details: "Details",
    payment: "Payment",
    review: "Review",
};

const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const visibleSteps = STEP_ORDER.slice(0, currentIndex + 1);
    return (
        <nav
            aria-label="Checkout progress"
            className="flex items-center flex-wrap gap-y-1 text-xs sm:text-sm mb-6 -mt-2"
        >
            <Link
                href="/cart"
                className="text-slate-500 hover:text-primaryColor underline-offset-2 hover:underline"
            >
                Cart
            </Link>
            {visibleSteps.map((key, idx) => {
                const isCurrent = key === currentStep;
                const isComplete = idx < currentIndex;
                return (
                    <span key={key} className="flex items-center">
                        <ChevronRight
                            className="mx-1.5 sm:mx-2 w-3.5 h-3.5 text-slate-400 shrink-0"
                            strokeWidth={2}
                        />
                        <span
                            className={
                                isCurrent
                                    ? "font-semibold text-slate-900 dark:text-slate-100"
                                    : "text-slate-600 dark:text-slate-300 inline-flex items-center gap-1"
                            }
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            {isComplete && (
                                <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                            )}
                            {STEP_LABELS[key]}
                        </span>
                    </span>
                );
            })}
        </nav>
    );
};

const BrandBadge = ({ src, alt }: { src: string; alt: string }) => (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md overflow-hidden bg-white ring-1 ring-slate-200 dark:ring-slate-700">
        <Image src={src} alt={alt} width={28} height={28} className="object-cover w-full h-full" />
    </span>
);

interface DeliveryOptionProps {
    value: "store_uber_pickme" | "courier";
    selected: boolean;
    onSelect: (v: "store_uber_pickme" | "courier") => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    trailing?: React.ReactNode;
}

const DeliveryOption = ({
    value,
    selected,
    onSelect,
    icon,
    title,
    subtitle,
    trailing,
}: DeliveryOptionProps) => (
    <label
        className={`group flex items-center gap-4 w-full p-4 rounded-xl border cursor-pointer transition-colors ${
            selected
                ? "border-primaryColor bg-primary-50/60 dark:bg-primary-900/20"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
    >
        <input
            type="radio"
            name="pickup"
            value={value}
            checked={selected}
            onChange={() => onSelect(value)}
            className="sr-only"
        />
        <span
            aria-hidden="true"
            className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                selected
                    ? "border-primaryColor bg-primaryColor"
                    : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
            }`}
        >
            {selected && <span className="w-2 h-2 rounded-full bg-white" />}
        </span>
        <span
            className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                selected
                    ? "bg-primaryColor/10 text-primaryColor"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
        >
            {icon}
        </span>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {title}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
            </div>
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
    </label>
);

interface Props {
    initialContactData: contactInformation;
    initialShippingData: CustomerAddress | null;
    paymentGateways: PaymentGateway[];
    setIsStorePickup: (v: boolean) => void;
    isStorePickup: boolean;
    setIsCardPayment: (v: boolean) => void;
    isCardPayment: boolean;
    totalPayment: number;
    setIsKokoPayment: (v: boolean) => void;
    isKokoPayment: boolean;
    isPriceFluctuation: any;
    onCheckoutSubmit: (payload: CheckoutSubmitPayload) => Promise<void> | void;
    isTOC: boolean;
    onTOCChange: () => void;
    tocError: boolean;
    loading: boolean;
    orderTotalLabel: string;
}

const UnifiedCheckoutForm = ({
    initialContactData,
    initialShippingData,
    paymentGateways,
    setIsStorePickup,
    isStorePickup,
    setIsCardPayment,
    isCardPayment,
    totalPayment,
    setIsKokoPayment,
    isKokoPayment,
    isPriceFluctuation,
    onCheckoutSubmit,
    isTOC,
    onTOCChange,
    tocError,
    loading,
    orderTotalLabel,
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
    const [state, setState] = useState("Western");
    const [postal, setPostal] = useState("");
    const [addressCountry, setAddressCountry] = useState("");
    const [addressType, setAddressType] = useState("home");

    // Payment Method State
    const [methodActive, setMethodActive] = useState<string>("");
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>({
        id: "",
        title: null,
    });

    const [pickupType, setPickupType] = useState<"store_uber_pickme" | "courier" | null>(null);

    const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
            setState(initialShippingData.state || "Western");
            setPostal(initialShippingData.postcode || "");
            setAddressCountry(initialShippingData.country || "");
            setAddressType("home");
        }
    }, [initialShippingData]);


    const handlePickupTypeChange = (type: "store_uber_pickme" | "courier") => {
        setPickupType(type);
        setIsStorePickup(type === "store_uber_pickme");
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

        if (!pickupType) {
            toast.error("Please select a delivery method.");
            return;
        }

        if (!selectedGateway.id) {
            toast.error("Please select a payment method.");
            return;
        }

        if (selectedGateway.id === "bacs" && !bankSlipFile) {
            toast.error("Please upload your bank slip before continuing.");
            return;
        }

        const addressFields = {
            firstName,
            lastName,
            address,
            apartment,
            city,
            state,
            postal,
            country: "LK",
            addressType,
        };

        const payload: CheckoutSubmitPayload = {
            contactInfo: { phone, email, country },
            deliveryAddress: addressFields,
            billingAddress: addressFields,
            paymentMethod: {
                selectedGateway: {
                    id: selectedGateway.id,
                    title: selectedGateway.title ?? null,
                },
                bankSlipFile: selectedGateway.id === "bacs" ? bankSlipFile : null,
            },
            isStorePickup: pickupType === "store_uber_pickme",
        };

        await onCheckoutSubmit(payload);
    };

    const getGatewayMeta = (gateway: PaymentGateway) => {
        switch (gateway.id) {
            case "payhere":
                return {
                    title: "Pay Online",
                    subtitle: "Secure online card payment",
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: (
                        <div className="flex items-center gap-1.5">
                            <BrandBadge src="/logos/visa.png" alt="Visa" />
                            <BrandBadge src="/logos/mastercard.png" alt="Mastercard" />
                            <span className="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">+3% fee</span>
                        </div>
                    ),
                };
            case "cod":
                return {
                    title: gateway.title || "Cash on delivery",
                    subtitle: "Pay with cash when your order arrives",
                    icon: <Banknote className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: null,
                };
            case "darazbnpl": {
                const perInstallment = totalPayment > 0 ? Math.ceil(totalPayment / 3) : 0;
                return {
                    title: gateway.title || "Koko Pay",
                    subtitle: "Split into 3 interest-free installments",
                    icon: <div className="w-8 h-5 flex items-center justify-center"><Image src="/koko.png" alt="Koko" width={40} height={20} /></div>,
                    trailing: perInstallment ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                3 × Rs {new Intl.NumberFormat("en-US").format(perInstallment)}
                            </span>
                            <Image src="/koko.png" alt="Koko" width={36} height={18} className="h-4 w-auto" />
                        </div>
                    ) : null,
                };
            }
            case "bacs":
                return {
                    title: gateway.title || "Direct bank transfer",
                    subtitle: "Commercial Bank — upload your slip after transfer",
                    icon: <Landmark className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            Instant
                        </span>
                    ),
                };
            case "geniebiz":
                return {
                    title: gateway.title || "Genie Pay",
                    subtitle: "Pay with your Genie mobile wallet",
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: null,
                };
            case "ndb-pay":
                return {
                    title: gateway.title || "NDB Pay",
                    subtitle: "Secure online card payment",
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: (
                        <div className="flex items-center gap-1.5">
                            <BrandBadge src="/logos/visa.png" alt="Visa" />
                            <BrandBadge src="/logos/mastercard.png" alt="Mastercard" />
                        </div>
                    ),
                };
            default:
                return {
                    title: gateway.title || "Other",
                    subtitle: "",
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: null,
                };
        }
    };

    const selectGateway = (gateway: PaymentGateway) => {
        setMethodActive(gateway.id);
        setSelectedGateway({ id: gateway.id, title: gateway.title });

        if (gateway.id !== "bacs") {
            setBankSlipFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
        }

        setIsKokoPayment(gateway.id === "darazbnpl");
        setIsCardPayment(gateway.id === "payhere");
    };

    const PaymentMethodCard = ({ gateway }: { gateway: PaymentGateway }) => {
        const active = methodActive === gateway.id;
        const meta = getGatewayMeta(gateway);

        return (
            <div
                className={`rounded-xl border transition-colors ${
                    active
                        ? "border-primaryColor bg-primary-50/60 dark:bg-primary-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
            >
                <label
                    htmlFor={gateway.id}
                    className="flex items-center gap-4 p-4 cursor-pointer"
                >
                    <input
                        id={gateway.id}
                        type="radio"
                        name="payment-method"
                        checked={active}
                        onChange={() => selectGateway(gateway)}
                        className="sr-only"
                    />
                    <span
                        aria-hidden="true"
                        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                            active
                                ? "border-primaryColor bg-primaryColor"
                                : "border-slate-300 dark:border-slate-600"
                        }`}
                    >
                        {active && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span
                        className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                            active
                                ? "bg-primaryColor/10 text-primaryColor"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                    >
                        {meta.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {meta.title}
                        </div>
                        {meta.subtitle && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {meta.subtitle}
                            </div>
                        )}
                    </div>
                    {meta.trailing && <div className="shrink-0">{meta.trailing}</div>}
                </label>

                {active && gateway.id === "bacs" && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-200 dark:border-slate-700 mt-1">
                        <p className="text-sm text-slate-600 dark:text-slate-300 pt-3">
                            Your order will be delivered to you after you transfer the payment to our bank account.
                        </p>
                        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                Bank details
                            </div>
                            <dl className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">Bank</dt>
                                    <dd>Commercial Bank</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">Account name</dt>
                                    <dd>GQ Mobiles Pvt Ltd</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">Account no.</dt>
                                    <dd className="font-mono">1000475584</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">Branch</dt>
                                    <dd>Head office</dd>
                                </div>
                            </dl>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                                Upload bank slip <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                id={`bank-slip-upload-${gateway.id}`}
                                accept="image/png, image/gif, image/jpeg, image/heic, image/heif, image/webp, image/bmp, image/tiff, application/pdf"
                                onChange={handleBankSlipChange}
                                className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primaryColor file:text-white hover:file:bg-slate-800 file:cursor-pointer cursor-pointer"
                            />
                            {previewUrl && bankSlipFile && (
                                <div className="mt-2 flex items-center gap-3">
                                    {bankSlipFile.type.startsWith("image/") ? (
                                        <div className="relative w-16 h-16 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                                            <Image
                                                src={previewUrl}
                                                alt="Bank slip preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <Check className="w-5 h-5 text-emerald-600" />
                                    )}
                                    <span className="text-xs text-slate-600 dark:text-slate-400 break-all">
                                        {bankSlipFile.name}
                                    </span>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                Please upload your bank transfer slip after completing the payment.
                            </p>
                        </div>
                        {gateway.description ? (
                            <div
                                className="text-sm text-slate-700 dark:text-slate-200"
                                dangerouslySetInnerHTML={{ __html: gateway.description }}
                            />
                        ) : (
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                                Make your payment directly into our bank account. Please attach your payment slip to this order. Your order will not be shipped until the funds have cleared in our account.
                            </p>
                        )}
                    </div>
                )}

                {active && gateway.id !== "bacs" && gateway.description && (
                    <div className="px-4 pb-4 pt-0">
                        <div className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-3">
                            <span dangerouslySetInnerHTML={{ __html: gateway.description }} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const contactDone = phone.length >= 9 && /.+@.+\..+/.test(email);
    const courierAddressDone =
        !!firstName && !!address && !!city && !!state;
    const deliveryDone =
        pickupType !== null &&
        !!firstName &&
        (pickupType === "store_uber_pickme" || courierAddressDone);
    const detailsDone = contactDone && deliveryDone;
    const paymentDone =
        !!selectedGateway.id &&
        (selectedGateway.id !== "bacs" || !!bankSlipFile);

    const currentStep: StepKey = !detailsDone
        ? "details"
        : !paymentDone
        ? "payment"
        : "review";

    return (
        <form id="checkout-form" onSubmit={handleFormSubmit} className="space-y-8">
            <CheckoutStepper currentStep={currentStep} />

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

            {/* Delivery Method Section */}
            <div className="overflow-hidden">
                <div className="p-0">
                    <h3 className="text-lg font-semibold mb-4">Delivery Method</h3>

                    <div className="space-y-3">
                        <DeliveryOption
                            value="courier"
                            selected={pickupType === "courier"}
                            onSelect={handlePickupTypeChange}
                            icon={<Truck className="w-5 h-5" strokeWidth={1.75} />}
                            title="Courier delivery"
                            subtitle="Island-wide delivery in 2–3 business days"
                            trailing={<span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Rs 500</span>}
                        />
                        <DeliveryOption
                            value="store_uber_pickme"
                            selected={pickupType === "store_uber_pickme"}
                            onSelect={handlePickupTypeChange}
                            icon={<Store className="w-5 h-5" strokeWidth={1.75} />}
                            title="Store Pickup / Uber / PickMe"
                            subtitle="Ready in ~2 hours · Colombo · during working hours"
                            trailing={
                                <div className="flex items-center gap-1.5">
                                    <BrandBadge src="/logos/uber.png" alt="Uber" />
                                    <BrandBadge src="/logos/pickme.png" alt="PickMe" />
                                </div>
                            }
                        />
                    </div>

                    {!pickupType && (
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-primaryColor animate-pulse" />
                            Select a delivery method to continue
                        </div>
                    )}

                    {pickupType && (
                    <div className="mt-6 space-y-4">
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
                                            value={state || "Western"}
                                            onChange={(e) => setState(e.target.value)}
                                            required={true}
                                        >
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
                            <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4 text-sm text-slate-700 dark:text-slate-300">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                    Ready in ~2 hours (Colombo, working hours)
                                </p>
                                <p>
                                    We&apos;ll notify you on the phone number above when your order is ready. You can collect in-store or arrange an Uber / PickMe from our Colombo location.
                                </p>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>

            {/* Payment Method Section */}
            {pickupType && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <div className="space-y-3">
                        {visiblePaymentGateways.map((gateway) => (
                            <PaymentMethodCard key={gateway.id} gateway={gateway} />
                        ))}
                    </div>
                </div>
            )}

            {isPreOrderCart && <PreOrderNotice className="mt-2" />}

            <div
                id="toc-section"
                className={`flex items-start text-sm rounded-lg transition-colors ${
                    tocError
                        ? "text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 p-3"
                        : "text-slate-500 dark:text-slate-400"
                }`}
            >
                <div className="relative flex gap-2">
                    <Checkbox
                        name="toc"
                        defaultChecked={isTOC}
                        onChange={onTOCChange}
                        sizeClassName="w-4 h-4"
                        className="pt-1"
                    />
                    <div>
                        <div>
                            By proceeding with your purchase you agree to our{" "}
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                href="/terms-and-conditions"
                                className="font-medium text-slate-900 underline dark:text-slate-200"
                            >
                                Terms and Conditions
                            </Link>
                            {" "}and{" "}
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                href="/privacy"
                                className="font-medium text-slate-900 underline dark:text-slate-200"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </div>
                        {tocError && (
                            <div className="mt-1 text-xs font-medium text-red-600">
                                Please agree to the terms to continue.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline self-center sm:self-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to cart
                </Link>
                <ButtonPrimary
                    type="submit"
                    disabled={loading}
                    className="sm:min-w-[240px] w-full sm:w-auto"
                >
                    {loading ? (
                        <Loader className="animate-spin text-gray-100 w-5 h-5" />
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <span>Confirm Order</span>
                            {orderTotalLabel && (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span
                                        className="font-semibold"
                                        dangerouslySetInnerHTML={{ __html: orderTotalLabel }}
                                    />
                                </>
                            )}
                        </span>
                    )}
                </ButtonPrimary>
            </div>

        </form>
    );
};

export default UnifiedCheckoutForm;

