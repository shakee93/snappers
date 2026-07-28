"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Input from "shared/Input/Input";
import CountryPhoneInput from "./components/CountryPhoneInput";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { CustomerAddress, PaymentGateway } from "@/graphql/types/graphql";
import { contactInformation } from "@/data/types";
import Select from "shared/Select/Select";
import { toast } from "sonner";
import { SRI_LANKAN_STATES, transformAddress } from "@/components/global/forms/HelperComps";
import {
    CHECKOUT_POSTCODE_PATTERN,
    CheckoutAddressSnapshot,
} from "@/hooks/useCheckoutAddressSync";
import { useCart } from "@/context/CartProvider";
import checkoutCopy from "@/content/checkout-copy.json";
import { formatPrice } from "@/lib/formatPrice";
import { PAYHERE_HIDE_THRESHOLD } from "@/lib/checkoutMath";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonBrand from "shared/Button/ButtonBrand";
import PreOrderNotice from "@/components/global/ui/PreOrderNotice";
import {
    Store,
    Truck,
    Zap,
    CreditCard,
    Landmark,
    Check,
    ChevronRight,
    ArrowLeft,
    Loader,
} from "lucide-react";

// Account shown inline in the BACS panel — sourced from site.config so the
// full bank list (rendered on the bank-details view) stays the single source.
const FEATURED_BANK_ACCOUNT =
    siteConfig.payment.bankAccounts.find((a) => a.featuredAtCheckout) ??
    siteConfig.payment.bankAccounts[0];

export type DeliveryType = "courier" | "store_pickup" | "flash_delivery";

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
    deliveryType: DeliveryType;
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
                className="text-slate-500 hover:text-primary-500 underline-offset-2 hover:underline"
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

const FIELD_CLASS = "border-2 border-slate-300 placeholder:text-slate-400 hover:border-slate-400 focus:!ring-0 focus:!border-primary-500 focus:outline-none dark:border-slate-600 dark:hover:border-slate-500";

type AddressFieldValues = {
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    postal: string;
};

const EMPTY_ADDRESS: AddressFieldValues = {
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "Western",
    postal: "",
};

// Postal is validated against the same pattern the address sync quotes on,
// so the stepper can't report "details done" for an address WooCommerce was
// never able to price. Matches the `pattern` on the postal input.
const isAddressComplete = (addr: AddressFieldValues) =>
    !!addr.firstName &&
    !!addr.lastName &&
    !!addr.address &&
    !!addr.city &&
    !!addr.state &&
    CHECKOUT_POSTCODE_PATTERN.test(addr.postal.trim());

interface AddressFieldsProps {
    idPrefix: string;
    values: AddressFieldValues;
    onChange: (patch: Partial<AddressFieldValues>) => void;
    nameOnly?: boolean;
}

const AddressFields = memo(({ idPrefix, values, onChange, nameOnly = false }: AddressFieldsProps) => (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div>
                <label htmlFor={`${idPrefix}-firstname`} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    First name
                </label>
                <Input
                    id={`${idPrefix}-firstname`}
                    className={`capitalize ${FIELD_CLASS}`}
                    value={values.firstName}
                    placeholder="e.g. Amila"
                    autoComplete="given-name"
                    onChange={(e) => onChange({ firstName: e.target.value })}
                    required={true}
                />
            </div>
            <div>
                <label htmlFor={`${idPrefix}-lastname`} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    Last name
                </label>
                <Input
                    id={`${idPrefix}-lastname`}
                    className={`capitalize ${FIELD_CLASS}`}
                    value={values.lastName}
                    placeholder="e.g. Perera"
                    autoComplete="family-name"
                    onChange={(e) => onChange({ lastName: e.target.value })}
                    required={true}
                />
            </div>
        </div>

        {nameOnly ? null : (
        <>
        <div className="sm:flex sm:space-x-3 sm:space-y-0 space-y-4">
            <div className="flex-1">
                <label htmlFor={`${idPrefix}-address1`} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    Address line 1
                </label>
                <Input
                    id={`${idPrefix}-address1`}
                    className={`capitalize ${FIELD_CLASS}`}
                    placeholder="Street address"
                    name={`${idPrefix}-address1`}
                    value={values.address}
                    type="text"
                    autoComplete="address-line1"
                    onChange={(e) => onChange({ address: e.target.value })}
                    required={true}
                />
            </div>
            <div className="sm:w-1/3">
                <label htmlFor={`${idPrefix}-address2`} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    Address line 2 <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <Input
                    id={`${idPrefix}-address2`}
                    className={`capitalize ${FIELD_CLASS}`}
                    placeholder="Apartment, suite, etc."
                    name={`${idPrefix}-address2`}
                    value={values.apartment}
                    autoComplete="address-line2"
                    onChange={(e) => onChange({ apartment: e.target.value })}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
            <div>
                <label htmlFor={`${idPrefix}-city`} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    City
                </label>
                <Input
                    id={`${idPrefix}-city`}
                    className={`normal-case ${FIELD_CLASS}`}
                    placeholder="e.g. Colombo"
                    value={values.city}
                    autoComplete="address-level2"
                    onChange={(e) => onChange({ city: e.target.value })}
                    required={true}
                />
            </div>
            <div>
                <label htmlFor={`${idPrefix}-state`} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    Province
                </label>
                <Select
                    id={`${idPrefix}-state`}
                    name={`${idPrefix}-state`}
                    className={FIELD_CLASS}
                    value={values.state || "Western"}
                    onChange={(e) => onChange({ state: e.target.value })}
                    required={true}
                >
                    {SRI_LANKAN_STATES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </Select>
            </div>
            <div>
                <label htmlFor={`${idPrefix}-postal`} className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    Postal code
                </label>
                <Input
                    id={`${idPrefix}-postal`}
                    className={FIELD_CLASS}
                    placeholder="e.g. 10100"
                    value={values.postal}
                    inputMode="numeric"
                    pattern="[0-9]{4,6}"
                    autoComplete="postal-code"
                    onChange={(e) => onChange({ postal: e.target.value })}
                    required={true}
                />
            </div>
        </div>
        </>
        )}
    </>
));
AddressFields.displayName = "AddressFields";

interface DeliveryOptionProps {
    value: DeliveryType;
    selected: boolean;
    onSelect: (v: DeliveryType) => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    chip?: { label: string; tone: "emerald" | "blue" };
    trailing?: React.ReactNode;
}

const CHIP_TONES = {
    emerald: "bg-header-action text-header-green",
    blue: "bg-header-accent text-header-green",
} as const;

const DeliveryOption = ({
    value,
    selected,
    onSelect,
    icon,
    title,
    subtitle,
    chip,
    trailing,
}: DeliveryOptionProps) => (
    <label
        className={`group flex items-center gap-4 w-full p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            selected
                ? "border-primary-500 bg-primary-50/60 dark:bg-primary-900/20"
                : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 hover:border-slate-300 hover:bg-slate-100 dark:hover:border-slate-600"
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
                    ? "border-primary-500 bg-primary-500"
                    : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
            }`}
        >
            {selected && <span className="w-2 h-2 rounded-full bg-white" />}
        </span>
        <span
            className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                selected
                    ? "bg-primary-500/10 text-primary-500"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
        >
            {icon}
        </span>
        <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                </span>
                {chip && (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ${CHIP_TONES[chip.tone]}`}
                    >
                        {chip.label}
                    </span>
                )}
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
    setDeliveryType: (v: DeliveryType | null) => void;
    deliveryType: DeliveryType | null;
    setIsCardPayment: (v: boolean) => void;
    isCardPayment: boolean;
    totalPayment: number;
    kokoTotal: number;
    setIsKokoPayment: (v: boolean) => void;
    isKokoPayment: boolean;
    isPriceFluctuation: any;
    onCheckoutSubmit: (payload: CheckoutSubmitPayload) => Promise<void> | void;
    onAddressChange: (snapshot: CheckoutAddressSnapshot | null) => void;
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
    setDeliveryType,
    deliveryType,
    setIsCardPayment,
    isCardPayment,
    totalPayment,
    kokoTotal,
    setIsKokoPayment,
    isKokoPayment,
    isPriceFluctuation,
    onCheckoutSubmit,
    onAddressChange,
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

    const [billingAddress, setBillingAddress] = useState<AddressFieldValues>(EMPTY_ADDRESS);
    const [shippingAddress, setShippingAddress] = useState<AddressFieldValues>(EMPTY_ADDRESS);
    const [shippingDifferent, setShippingDifferent] = useState(false);

    const handleBillingChange = useCallback((patch: Partial<AddressFieldValues>) => {
        setBillingAddress((prev) => ({ ...prev, ...patch }));
    }, []);
    const handleShippingChange = useCallback((patch: Partial<AddressFieldValues>) => {
        setShippingAddress((prev) => ({ ...prev, ...patch }));
    }, []);

    // Payment Method State
    const [methodActive, setMethodActive] = useState<string>("");
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>({
        id: "",
        title: null,
    });

    const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { cart } = useCart();

    const courierShippingLabel = useMemo(() => {
        const rates = cart?.availableShippingMethods?.[0]?.rates;
        const flat = rates?.find(
            (r) => r?.methodId === "flat_rate" || /flat rate|courier/i.test(r?.label || "")
        );
        const cost = flat?.cost ?? rates?.[0]?.cost;
        const numeric = typeof cost === "string" ? parseFloat(cost) : Number(cost);
        if (!Number.isFinite(numeric) || numeric <= 0) return null;
        return formatPrice(numeric, { decimals: 0 });
    }, [cart]);

    const handleBankSlipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList?.[0]) {
            const file = fileList[0];
            setBankSlipFile(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Revoke any outstanding blob URL when the component unmounts so we don't
    // leak it (the user navigating away from /checkout, or HMR during dev).
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Initialize Contact Info
    useEffect(() => {
        if (initialContactData) {
            setPhone(initialContactData?.phone || "");
            setEmail(initialContactData?.email || "");
            setCountry(initialContactData?.country || "LK");
        }
    }, [initialContactData]);

    useEffect(() => {
        if (initialShippingData) {
            setBillingAddress({
                firstName: initialShippingData.firstName || "",
                lastName: initialShippingData.lastName || "",
                address: initialShippingData.address1 || "",
                apartment: initialShippingData.address2 || "",
                city: initialShippingData.city || "",
                state: initialShippingData.state || "Western",
                postal: initialShippingData.postcode || "",
            });
        }
    }, [initialShippingData]);

    // WooCommerce quotes shipping against the customer's stored address, so
    // the totals on this page are only correct once the address the customer
    // typed has been pushed to it. Report every address edit upward; the page
    // debounces and dedupes. Store pickup has no destination, so there is
    // nothing to quote.
    const addressSnapshot = useMemo<CheckoutAddressSnapshot | null>(() => {
        if (!deliveryType || deliveryType === "store_pickup") return null;

        const billing = transformAddress({ ...billingAddress, country: "LK" });
        const shipping = shippingDifferent
            ? transformAddress({ ...shippingAddress, country: "LK" })
            : billing;

        return { billing, shipping };
    }, [deliveryType, shippingDifferent, billingAddress, shippingAddress]);

    useEffect(() => {
        onAddressChange(addressSnapshot);
    }, [addressSnapshot, onAddressChange]);

    const handlePickupTypeChange = (type: DeliveryType) => {
        setDeliveryType(type);
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
                totalPayment >= PAYHERE_HIDE_THRESHOLD
            ) {
                return false;
            }
            return true;
        });
    }, [paymentGateways, isPreOrderCart, isPriceFluctuation, totalPayment, cart]);

    // Gateways that should appear but be greyed-out for the current delivery
    // method. Cash on Delivery is incompatible with Flash Delivery — the
    // courier driver doesn't collect cash on our behalf.
    const gatewayDisabledReason = (gatewayId: string): string | null => {
        if (deliveryType === "flash_delivery" && gatewayId === "cod") {
            return "Not available with Flash Delivery — pay online instead";
        }
        return null;
    };

    // Auto-select first enabled gateway when none is selected.
    useEffect(() => {
        if (!visiblePaymentGateways.length || selectedGateway.id) return;
        const g = visiblePaymentGateways.find((gw) => !gatewayDisabledReason(gw.id));
        if (!g) return;
        setMethodActive(g.id);
        const meta = getGatewayMeta(g);
        setSelectedGateway({ id: g.id, title: meta.title });
        setIsKokoPayment(g.id === "darazbnpl");
        setIsCardPayment(g.id === "payhere" || g.id === "webxpay");
        // eslint-disable-next-line react-hooks/exhaustive-deps -- gatewayDisabledReason depends on deliveryType which is already in deps
    }, [visiblePaymentGateways, selectedGateway.id, deliveryType, setIsCardPayment, setIsKokoPayment]);

    // If the currently-selected gateway becomes disabled (e.g. user picks COD
    // then switches to Flash Delivery), clear it so the form can't submit
    // through an option the user can no longer see as available.
    useEffect(() => {
        if (!selectedGateway.id) return;
        if (!gatewayDisabledReason(selectedGateway.id)) return;
        setSelectedGateway({ id: "", title: null });
        setMethodActive("");
        setIsKokoPayment(false);
        setIsCardPayment(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deliveryType, selectedGateway.id]);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!deliveryType) {
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

        if (
            shippingDifferent &&
            deliveryType !== "store_pickup" &&
            !isAddressComplete(shippingAddress)
        ) {
            toast.error("Please complete the shipping address.");
            return;
        }

        const billingFields = {
            ...billingAddress,
            country: "LK",
            addressType: "home",
        };

        const shippingFields =
            shippingDifferent && deliveryType !== "store_pickup"
                ? { ...shippingAddress, country: "LK", addressType: "home" }
                : billingFields;

        const payload: CheckoutSubmitPayload = {
            contactInfo: { phone, email, country },
            deliveryAddress: shippingFields,
            billingAddress: billingFields,
            paymentMethod: {
                selectedGateway: {
                    id: selectedGateway.id,
                    title: selectedGateway.title ?? null,
                },
                bankSlipFile: selectedGateway.id === "bacs" ? bankSlipFile : null,
            },
            deliveryType,
        };

        await onCheckoutSubmit(payload);
    };

    const getGatewayMeta = (gateway: PaymentGateway) => {
        switch (gateway.id) {
            case "payhere":
                return {
                    title: checkoutCopy.webxpay?.title || "Pay online",
                    subtitle:
                        checkoutCopy.webxpay?.subtitle ||
                        "Secure online card payment",
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: (
                        <div className="flex items-center gap-1.5">
                            <BrandBadge src="/logos/visa.png" alt="Visa" />
                            <BrandBadge src="/logos/mastercard.png" alt="Mastercard" />
                        </div>
                    ),
                };
            case "cod":
                return {
                    title: gateway.title || "Cash on delivery: Powered by Citypak",
                    subtitle: "Powered by Citypak",
                    icon: (
                        <div className="w-8 h-5 flex items-center justify-center">
                            <Image src="/citypak.png" alt="citypak" width={40} height={20} />
                        </div>
                    ),
                    trailing: null,
                };
            case "darazbnpl": {
                const kokoBase = kokoTotal > 0 ? kokoTotal : totalPayment;
                const perInstallment = kokoBase > 0 ? kokoBase / 3 : 0;
                return {
                    title: gateway.title || "Koko Pay",
                    subtitle: "Split into 3 interest-free installments",
                    icon: <div className="w-8 h-5 flex items-center justify-center"><Image src="/koko.png" alt="Koko" width={40} height={20} /></div>,
                    trailing: perInstallment ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                3 × {formatPrice(perInstallment)}
                            </span>
                            <Image src="/koko.png" alt="Koko" width={36} height={18} className="h-4 w-auto" />
                        </div>
                    ) : null,
                };
            }
            case "bacs":
                return {
                    title: gateway.title || "Direct bank transfer",
                    subtitle: `${FEATURED_BANK_ACCOUNT.bank} — upload your slip after transfer`,
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
            case "webxpay":
                return {
                    title: checkoutCopy.webxpay.title,
                    subtitle: checkoutCopy.webxpay.subtitle,
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: (
                        <div className="flex items-center gap-1.5">
                            <BrandBadge src="/logos/visa.png" alt="Visa" />
                            <BrandBadge src="/logos/mastercard.png" alt="Mastercard" />
                        </div>
                    ),
                };
            default: {
                // WP gateway titles can be a long card/wallet list — show a clean label.
                const rawTitle = gateway.title || "";
                const looksLikeCardList =
                    rawTitle.includes("Visa") && rawTitle.includes("/");
                return {
                    title: looksLikeCardList
                        ? checkoutCopy.webxpay.title
                        : rawTitle || "Other",
                    subtitle: looksLikeCardList
                        ? checkoutCopy.webxpay.subtitle
                        : "",
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.75} />,
                    trailing: looksLikeCardList ? (
                        <div className="flex items-center gap-1.5">
                            <BrandBadge src="/logos/visa.png" alt="Visa" />
                            <BrandBadge src="/logos/mastercard.png" alt="Mastercard" />
                        </div>
                    ) : null,
                };
            }
        }
    };

    const selectGateway = (gateway: PaymentGateway) => {
        if (gatewayDisabledReason(gateway.id)) return;
        setMethodActive(gateway.id);
        const meta = getGatewayMeta(gateway);
        setSelectedGateway({ id: gateway.id, title: meta.title });

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
        const disabledReason = gatewayDisabledReason(gateway.id);
        const isDisabled = !!disabledReason;

        return (
            <div
                className={`rounded-xl border-2 transition-colors ${
                    isDisabled
                        ? "border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/40 opacity-60"
                        : active
                            ? "border-primary-500 bg-primary-50/60 dark:bg-primary-900/20"
                            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 hover:border-slate-300 hover:bg-slate-100 dark:hover:border-slate-600"
                }`}
                aria-disabled={isDisabled || undefined}
            >
                <label
                    htmlFor={gateway.id}
                    className={`flex items-center gap-4 p-4 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                    <input
                        id={gateway.id}
                        type="radio"
                        name="payment-method"
                        checked={active}
                        disabled={isDisabled}
                        onChange={() => selectGateway(gateway)}
                        className="sr-only"
                    />
                    <span
                        aria-hidden="true"
                        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                            isDisabled
                                ? "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                                : active
                                    ? "border-primary-500 bg-primary-500"
                                    : "border-slate-300 dark:border-slate-600"
                        }`}
                    >
                        {active && !isDisabled && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span
                        className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                            isDisabled
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                : active
                                    ? "bg-primary-500/10 text-primary-500"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                    >
                        {meta.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${isDisabled ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                            {meta.title}
                        </div>
                        {isDisabled ? (
                            <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                {disabledReason}
                            </div>
                        ) : meta.subtitle ? (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {meta.subtitle}
                            </div>
                        ) : null}
                    </div>
                    {!isDisabled && meta.trailing && <div className="shrink-0">{meta.trailing}</div>}
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
                                    <dd>{FEATURED_BANK_ACCOUNT.bank}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">Account name</dt>
                                    <dd>{FEATURED_BANK_ACCOUNT.accName}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">Account no.</dt>
                                    <dd className="font-mono">{FEATURED_BANK_ACCOUNT.accNo}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-slate-500">Branch</dt>
                                    <dd>{FEATURED_BANK_ACCOUNT.branch}</dd>
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
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-header-action file:text-header-green hover:file:opacity-90 file:cursor-pointer cursor-pointer"
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

    const contactDone = /^[0-9]{9,12}$/.test(phone) && /.+@.+\..+/.test(email);
    const nameDone = !!billingAddress.firstName && !!billingAddress.lastName;
    const useSeparateShipping =
        shippingDifferent && deliveryType !== "store_pickup";
    const deliveryDone =
        deliveryType !== null &&
        nameDone &&
        (deliveryType === "store_pickup" ||
            (isAddressComplete(billingAddress) &&
                (!useSeparateShipping || isAddressComplete(shippingAddress))));
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
                            <label htmlFor="checkout-email" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                                Email address
                            </label>
                            <Input
                                id="checkout-email"
                                className={FIELD_CLASS}
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
                            selected={deliveryType === "courier"}
                            onSelect={handlePickupTypeChange}
                            icon={<Truck className="w-5 h-5" strokeWidth={1.75} />}
                            title="Courier delivery"
                            subtitle="Island-wide delivery in 2–3 business working days"
                            trailing={courierShippingLabel ? (
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {courierShippingLabel}
                                </span>
                            ) : null}
                        />
                        <DeliveryOption
                            value="store_pickup"
                            selected={deliveryType === "store_pickup"}
                            onSelect={handlePickupTypeChange}
                            icon={<Store className="w-5 h-5" strokeWidth={1.75} />}
                            title="Store Pickup"
                            subtitle="Ready during working hours"
                            chip={{ label: checkoutCopy.pickupChipLabel, tone: "emerald" }}
                            trailing={
                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    Free
                                </span>
                            }
                        />
                        <DeliveryOption
                            value="flash_delivery"
                            selected={deliveryType === "flash_delivery"}
                            onSelect={handlePickupTypeChange}
                            icon={<Zap className="w-5 h-5" strokeWidth={1.75} />}
                            title="Flash Delivery"
                            subtitle="You arrange Uber / PickMe pickup"
                            chip={{ label: checkoutCopy.flashDeliveryChipLabel, tone: "blue" }}
                            trailing={
                                <div className="hidden sm:flex items-center gap-1.5">
                                    <BrandBadge src="/logos/uber.png" alt="Uber" />
                                    <BrandBadge src="/logos/pickme.png" alt="PickMe" />
                                </div>
                            }
                        />
                    </div>

                    {!deliveryType && (
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-500 animate-pulse" />
                            Select a delivery method to continue
                        </div>
                    )}

                    {deliveryType && (
                    <div className="mt-6 space-y-4">
                        {deliveryType === "store_pickup" ? (
                            <>
                                <AddressFields
                                    idPrefix="checkout"
                                    values={billingAddress}
                                    onChange={handleBillingChange}
                                    nameOnly
                                />
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {checkoutCopy.storePickupNote}
                                </p>
                            </>
                        ) : (
                            <>
                                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    Billing address
                                </h4>
                                <AddressFields
                                    idPrefix="checkout"
                                    values={billingAddress}
                                    onChange={handleBillingChange}
                                />

                                <Checkbox
                                    name="shipping-different"
                                    label="Shipping address different from billing address"
                                    checked={shippingDifferent}
                                    onChange={setShippingDifferent}
                                />

                                {shippingDifferent && (
                                    <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
                                        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            Shipping address
                                        </h4>
                                        <AddressFields
                                            idPrefix="ship"
                                            values={shippingAddress}
                                            onChange={handleShippingChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    )}
                </div>
            </div>

            {/* Payment Method Section */}
            {deliveryType && (
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

            <label
                htmlFor="toc"
                id="toc-section"
                className={`flex items-start gap-2 text-sm rounded-lg p-3 cursor-pointer transition-colors ${
                    tocError
                        ? "text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
            >
                <Checkbox
                    name="toc"
                    defaultChecked={isTOC}
                    onChange={onTOCChange}
                    sizeClassName="w-4 h-4"
                    className="pt-1"
                />
                <div className="flex-1">
                    <div>
                        By proceeding with your purchase you agree to our{" "}
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            href="/terms-and-conditions"
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-slate-900 underline dark:text-slate-200"
                        >
                            Terms and Conditions
                        </Link>
                        {" "}and{" "}
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            href="/privacy"
                            onClick={(e) => e.stopPropagation()}
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
            </label>

            <div className="pt-2 pb-10 md:pb-14 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline self-center sm:self-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to cart
                </Link>
                <ButtonBrand
                    type="submit"
                    disabled={loading}
                    className="sm:min-w-[240px] w-full sm:w-auto"
                >
                    {loading ? (
                        <Loader className="animate-spin text-header-green w-5 h-5" />
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
                </ButtonBrand>
            </div>

        </form>
    );
};

export default UnifiedCheckoutForm;

