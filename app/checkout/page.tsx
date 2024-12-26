/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FetchResult, useMutation, useQuery } from "@apollo/client";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import {
  GET_PAYMENT_GATEWAYS,
  UPDATE_SHIPPING_TOTAL,
} from "@/graphql/defs/cart";
import {
  CHECKOUT,
  COMPLETE_ORDER_PAYMENT,
  GUEST_CHECKOUT,
  GUEST_CHECKOUT_MUTATION,
} from "@/graphql/defs/order";
import {
  CheckoutPayload,
  CustomerAddressInput,
  PaymentGateway,
} from "@/graphql/types/graphql";

import CheckoutDetails from "./CheckoutDetails";
import CartItems from "./CartItems";
import { toast } from "sonner";
import { PayhereStatus, PaymentDetailsWithoutUrls } from "@/data/types";
import Script from "next/script";
import { usePayhere } from "../components/Payment/Payhere";
import { useRouter } from "next/navigation";
import PaymentModal from "@/app/components/Payment/PaymentModal";
import { useSession } from "@/context/SessionProvider";
import { Info, Loader } from "lucide-react";
import {
  savePaymentDetails,
  sentConfirmation,
  transformAddress,
} from "@/components/AddressPageComps/HelperComps";
import { useStats } from "react-instantsearch";
import { Metadata } from "next/types";

interface FormData {
  contactInfo: Record<string, any>;
  deliveryAddress: any;
  billingAddress: any;
  paymentMethod: {
    selectedGateway?: {
      id?: string;
    };
  };
}

const CheckoutPage = () => {
  const { cart, removeFromCart, updateCart } = useCart();
  const [finalOrderTotal, setFinalOrderTotal] = useState(null);
  const { customer, fetchCustomer } = useSession();

  const { data } = useQuery(GET_PAYMENT_GATEWAYS);
  const paymentGateways: PaymentGateway[] = data?.paymentGateways?.nodes;
  const [tabActive, setTabActive] = useState<
    | "ContactInfo"
    | "DeliveryAddress"
    | "BillingAddress"
    | "PaymentMethod"
    | "order-cart"
  >("ContactInfo");

  // const FORMDATA_DUMMY_OBJECT = {
  //   contactInfo: {
  //     phone: "0750278330",
  //     email: "shadeersadikeen@gmail.com",
  //   },
  //   deliveryAddress: {
  //     firstName: "shadeer",
  //     lastName: "sadikeen",
  //     address: "123",
  //     apartment: "araliya uyana, megoda kolonnawa",
  //     city: "welllampitiya , colombo",
  //     state: "",
  //     postal: "",
  //     country: "LK",
  //     addressType: "home",
  //   },
  //   billingAddress: {
  //     firstName: "shadeer",
  //     lastName: "sadikeen",
  //     address: "123",
  //     apartment: "araliya uyana, megoda kolonnawa",
  //     city: "welllampitiya , colombo",
  //     state: "",
  //     postal: "",
  //     country: "LK",
  //     addressType: "home",
  //   },
  //   paymentMethod: {
  //     selectedGateway: {
  //       id: "bacs",
  //       title: "Direct bank transfer",
  //     },
  //   },
  // };

  // const [formData, setFormData] = useState(FORMDATA_DUMMY_OBJECT);

  const [formData, setFormData] = useState<FormData>({
    contactInfo: {},
    deliveryAddress: {},
    billingAddress: {},
    paymentMethod: {
      selectedGateway: {},
    },
  });
  // create state for the payhere random id
  const [payherPaymentID, setPayherPaymentID] = useState<string | null>(null);

  const [payhereHandleStatus, setPayhereHandleStatus] =
    useState<PayhereStatus>("idle");

  const [isStorePickup, setIsStorePickup] = useState(false);
  const [isCardPayment, setIsCardPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState({
    contactInfo: false,
    deliveryAddress: false,
    paymentMethod: false,
    billingAddress: false,
  });

  const [shippingTotal, setShippingTotal] = useState();
  const [orderTotal, setOrderTotal] = useState<string | null>(null);
  const [paymentData, setPaymentData] =
    useState<PaymentDetailsWithoutUrls | null>(null);
  const [showBankTransfer, setShowBankTransfer] = useState<boolean>(false);
  const [wantToSHowBankTransfer, setWantToSHowBankTransfer] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalWithTax, setTotalWithTax] = useState<string | null>();
  const [isTOC, setTOC] = useState<boolean>(false);
  const [freeShipping, setFreeShipping] = useState<boolean>(false);
  const [confirmOrderErrors, setConfirmOrderErrors] = useState<string[]>([]);
  const [guestCheckoutData, setGuestCheckoutData] = useState<any>();

  const handleTOC = () => {
    // Toggle the state and get the updated value
    const updatedTOC = !isTOC;
    setTOC(updatedTOC);

    // Log the updated value
    // console.log({ updatedTOC });
  };
  // TODO: Uncomment this for the redirect on cart free
  useEffect(() => {
    if (cart && cart?.contents?.nodes?.length === 0) {
      router.push("/");
    }
    if (cart?.total !== null && cart?.total !== undefined) {
      setOrderTotal(cart?.total);
    }
  }, [cart]);

  useEffect(() => {
    fetchCustomer();
  }, []);

  // MUTATIONS
  const [updateCartShippingTotalMutation] = useMutation(UPDATE_SHIPPING_TOTAL);
  const [
    checkoutMutation,
    {
      // data: realCheckoutData,
    },
  ] = useMutation(CHECKOUT);
  const [completeOrderPayment] = useMutation(COMPLETE_ORDER_PAYMENT);
  // const  [createOrderGuest] = useMutation(GUEST_CHECKOUT_MUTATION)
  const [guestCheckout] = useMutation(GUEST_CHECKOUT);

  // Creating a Order using For Guest. Instead of using direct checkout mutation.
  const [
    createOrderGuest,
    { loading: checkoutLoading, error: checkoutError, data: checkoutData },
  ] = useMutation(GUEST_CHECKOUT_MUTATION);

  // Contexts
  const router = useRouter();
  const initiatePayment = usePayhere();

  // console.log('cart', cart);

  useEffect(() => {
    const hasFreeShipping: any = cart?.appliedCoupons?.some(
      (coupon) => coupon?.code === "free-shipping"
    );
    if (hasFreeShipping) {
      setFreeShipping(true);
    }
  }, [cart]);

  const updateFormData = (section: string, data: any) => {
    // console.log("data", JSON.stringify(data, null, 2));
    // console.log("section", JSON.stringify(section, null, 2));
    // Form data changing here!.

    setFormData((prevData) => {
      let updatedSection;

      if (data === null || data === undefined) {
        updatedSection = {};
      } else {
        updatedSection = {
          ...prevData[section as keyof FormData],
          ...data,
        };
      }

      return {
        ...prevData,
        [section as keyof FormData]: updatedSection,
      };
    });
  };

  const handleConfirmationChange = (component: string, value: boolean) => {
    setIsConfirmed((prevConfirmed) => {
      return {
        ...prevConfirmed,
        [component]: value,
      };
    });
  };

  const implementCheckoutAfterPayhere = async () => {
    const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;
    const isPayhere = formData?.paymentMethod?.selectedGateway?.id == "payhere";
    if (paymentMethodId === undefined) {
      console.log("transaction message failed");
      console.error("Payment method ID is undefined");
      toast.error("Payment Method was not chosen.");
      return;
    }

    if (payherPaymentID == null) {
      toast("payhere payment not initiated");
      return;
    }

    const shippingMethod = getShippingMethod(shippingTotal);
    const shippingDetails = isStorePickup
      ? {
          ...transformAddress(formData.deliveryAddress),
          address1: "Store Pickup",
          address2: "",
          city: "Store Pickup",
          state: "",
          postcode: "",
        }
      : transformAddress(formData.deliveryAddress);

    const email = formData?.contactInfo?.email;

    const billingDetails = {
      ...transformAddress(formData.billingAddress),
      email: formData?.contactInfo?.email,
    };

    const customerNoteHTML = `
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Phone Number:</strong> ${formData?.contactInfo?.phone}</p>
        <p><strong>Payhere Payment ID:</strong> ${payherPaymentID}</p>
        ${isStorePickup ? "<p><strong>Pickup Location:</strong> Store</p>" : ""}
    `;

    try {
      const variables = {
        input: {
          paymentMethod: paymentMethodId,
          shippingMethod,
          shipping: shippingDetails,
          billing: billingDetails,
          customerNote: customerNoteHTML,
        },
      };


      const { data } =
        customer?.id === "guest"
          ? await guestCheckout({ variables })
          : await checkoutMutation({ variables });

      if (!data || !data.checkout) {
        toast.error("Failed to process the order after payment");
        return;
      }

      toast.loading("Please wait, we are confirming your order...");

      let confirmation = await sentConfirmation(data.checkout.order.databaseId);
      if (confirmation) {
        toast.dismiss();
        toast.success(
          "Congratulations! Your order has been successfully confirmed."
        );
      } else {
        toast.error("Failed to confirm the order after payment");
        toast.dismiss();
      }

      const checkoutDetails = savePaymentDetails(data);
      setPaymentData(checkoutDetails);

      const {
        shippingaddress1,
        shippingaddress2,
        city,
        billingaddress1,
        billingaddress2,
        lineItems,
        shippingTotal,
        subtotal,
        date,
      } = checkoutDetails;

      const updatedCheckoutDetails = {
        ...checkoutDetails,
        lineItems: lineItems,
        subtotal: subtotal,
        shippingTotal: shippingTotal,
        date: date,
        billingaddress1: billingaddress1,
        billingaddress2: billingaddress2,
        shippingaddress1: shippingaddress1,
        shippingaddress2: shippingaddress2,
        city: city,
      };

      if (
        customer?.id === "guest" ||
        checkoutDetails.order_id == "guest_checkout"
      ) {
        const queryParams = new URLSearchParams({
          ...updatedCheckoutDetails,
          lineItems: JSON.stringify(updatedCheckoutDetails.lineItems),
          subtotal: String(updatedCheckoutDetails.subtotal),
          shippingTotal: String(updatedCheckoutDetails.shippingTotal),
          date: String(updatedCheckoutDetails.date),
          billingaddress1: String(updatedCheckoutDetails.billingaddress1),
          billingaddress2: String(updatedCheckoutDetails.billingaddress2),
          shippingaddress1: String(updatedCheckoutDetails.shippingaddress1),
          shippingaddress2: String(updatedCheckoutDetails.shippingaddress2),
          city: updatedCheckoutDetails.city || "",
          order_id: updatedCheckoutDetails.order_id,
        }).toString();
        const redirectUrl = `/checkout/guest_checkout?${queryParams}&ordermethod=guest`;
        router.push(redirectUrl);
        return;
      }

      let redirectUrl = `checkout/${checkoutDetails.order_id}`;
      router.push(redirectUrl);
    } catch (error) {
      console.error("Error in implementCheckoutAfterPayhere:", error);
      toast.error("Failed to complete the order after payment");
      setLoading(false);
    }
  };

  useEffect(() => {
    switch (payhereHandleStatus) {
      case "finished":
        implementCheckoutAfterPayhere();
        setLoading(false);
        break;
      case "dismissed":
        setLoading(false);
        break;
      case "error":
        toast.error("error while initiate payment");
        break;

      default:
        break;
    }
  }, [payhereHandleStatus]);

  const updateShippingTotal = async () => {
    const hasFreeShipping: any = cart?.appliedCoupons?.some(
      (coupon) => coupon?.code === "free-shipping"
    );
    if (hasFreeShipping) {
      setFreeShipping(true);
    }
    // console.log('isStorePickup', isStorePickup);
    try {
      const shippingMethods = isStorePickup
        ? "pickup_location:0"
        : freeShipping
        ? "wbs:5c9bd062_free_shipping"
        : "wbs:0dd3bc79_weight_based_shipping";

      const total: any = cart?.total;
      setOrderTotal(freeShipping ? cart?.subtotal : total);

      if (customer?.id === "guest") {
        const subtotal: any = cart?.subtotal;

        if (isStorePickup || freeShipping) {
          setOrderTotal(subtotal);
        } else {
          setOrderTotal(total);
        }
      }

      const { data } = await updateCartShippingTotalMutation({
        variables: { input: { shippingMethods } },
      });

      // console.log("data in shippng", data);

      if (data?.updateShippingMethod?.cart) {
        const { total, shippingTotal, subtotal } =
          data.updateShippingMethod.cart;
        if (freeShipping) {
          setOrderTotal(subtotal);
          setShippingTotal(shippingTotal);
        } else {
          setOrderTotal(total);
          setShippingTotal(shippingTotal);
        }
      } else {
        console.error(
          "Failed to update cart shipping total. No valid data returned."
        );
      }
    } catch (error) {
      console.error("An error occurred while updating shipping total:", error);
    }
  };

  useEffect(() => {
    updateShippingTotal().then((r) => r);
  }, [isStorePickup, updateCartShippingTotalMutation, freeShipping]);

  const paymentDetails = useMemo(() => {
    return paymentData;
  }, [paymentData]);

  const ImplementPayhere = async () => {
    let generatedOrderId = crypto.randomUUID();
    setPayherPaymentID(generatedOrderId);

    let { firstName, lastName, city, apartment } =
      formData.billingAddress as any;
    let { email, phone } = formData.contactInfo;

    if (
      !orderTotal ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !apartment ||
      !city
    ) {
      toast.error("No order found");
      return;
    }

    const products = cart?.contents?.nodes;

    const productList = products?.map((product: any) => {
      const productName = product.product.node.name;
      const varProduct = product.product.node.type;

      const attributes = Object.keys(product.product.node).filter((key) =>
        key.startsWith("allPa")
      );
      const attributeValues = attributes
        .map((attr) => {
          const nodes = product.product.node[attr]?.nodes;
          return nodes && nodes.length > 0 ? nodes[0].name : "";
        })
        .filter(Boolean);

      const productString =
        varProduct === "VARIABLE"
          ? `${productName} | ${attributeValues.join(" | ")}`
          : productName;

      return productString;
    });

    let checkoutDetails: PaymentDetailsWithoutUrls = {
      amount: isCardPayment ? totalWithTax : orderTotal,
      order_id: generatedOrderId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      items: productList?.join(" , "),
      address: city + apartment,
      city: city,
    };

    if (!initiatePayment) {
      toast.error("Payhere not initiated");
      return;
    }

    setPayhereHandleStatus("loading");
    initiatePayment(checkoutDetails, setPayhereHandleStatus).then((r) => r);
  };

  function ImplementBankTransfer() {
    setWantToSHowBankTransfer(false);
    setShowBankTransfer(true);
  }

  useEffect(() => {
    if (!paymentDetails) {
      return;
    }

    const isCashOnDelivery =
      formData?.paymentMethod?.selectedGateway?.id == "cod";

    let checkoutDetails = paymentDetails;

    const {
      shippingaddress1,
      shippingaddress2,
      city,
      billingaddress1,
      billingaddress2,
      lineItems,
      shippingTotal,
      subtotal,
      date,
    } = checkoutDetails;

    const updatedCheckoutDetails = {
      ...checkoutDetails,
      lineItems: lineItems,
      subtotal: subtotal,
      shippingTotal: shippingTotal,
      date: date,
      billingaddress1: billingaddress1,
      billingaddress2: billingaddress2,
      shippingaddress1: shippingaddress1,
      shippingaddress2: shippingaddress2,
      city: city,
    };

    if (isCashOnDelivery) {
      console.log("isCashOnDelivery", updatedCheckoutDetails);
      if (
        customer?.id === "guest" ||
        checkoutDetails.order_id == "guest_checkout"
      ) {
        const queryParams = new URLSearchParams({
          ...updatedCheckoutDetails,
          lineItems: JSON.stringify(updatedCheckoutDetails.lineItems),
          subtotal: String(updatedCheckoutDetails.subtotal),
          shippingTotal: String(updatedCheckoutDetails.shippingTotal),
          date: String(updatedCheckoutDetails.date),
          billingaddress1: String(updatedCheckoutDetails.billingaddress1),
          billingaddress2: String(updatedCheckoutDetails.billingaddress2),
          shippingaddress1: String(updatedCheckoutDetails.shippingaddress1),
          shippingaddress2: String(updatedCheckoutDetails.shippingaddress2),
          city: updatedCheckoutDetails.city || "",
          order_id: updatedCheckoutDetails.order_id,
        }).toString();
        const redirectUrl = `/checkout/guest_checkout?${queryParams}&ordermethod=guest`;
        router.push(redirectUrl);
        return;
      }
      toast.info("You'll be on the thank you page in just a moment.");
      let redirectUrl = `checkout/${checkoutDetails.order_id}`;
      router.push(redirectUrl);
    }
  }, [paymentData]);

  // localStorage.setItem(
  //   "checkoutDetails",
  //   JSON.stringify(checkoutDetails)
  // )

  // if (isPayhere) {
  //   try {
  //     ImplementPayhere(checkoutDetails);
  //     return;
  //   } catch (e) {
  //     console.log("Error while creating Payhere:", e);
  //   }
  // }

  // if (isBankTransfer) {
  //   try {
  //     ImplementBankTransfer();
  //   } catch (e) {
  //     // console.log("Error while creating BankTransfer:", e);
  //     toast.error("Error on BankTransfer");
  //   }
  // }

  const handleCheckoutProcess = async () => {
    // console.log("isConfirmed", isConfirmed);
    let errors = [];
    if (!isConfirmed.contactInfo) {
      errors.push("Contact info is missing.");
    }
    if (!isConfirmed.deliveryAddress) {
      errors.push("Delivery address is missing.");
    }
    if (!isConfirmed.billingAddress) {
      errors.push("Billing address is missing.");
    }
    if (!isConfirmed.paymentMethod) {
      errors.push("Payment method is missing.");
    }
    if (!isTOC) {
      errors.push("Terms and conditions are not accepted.");
    }
    if (errors.length > 0) {
      setConfirmOrderErrors(errors);
      return;
    }

    const isBankTransfer =
      formData?.paymentMethod?.selectedGateway?.id == "bacs";
    const isPayhere = formData?.paymentMethod?.selectedGateway?.id == "payhere";
    const isCashOnDelivery =
      formData?.paymentMethod?.selectedGateway?.id == "cod";

    // console.log("formData: ", formData);

    if (isBankTransfer) {
      if (wantToSHowBankTransfer) {
        ImplementBankTransfer();
        return;
      }
      try {
        ImplementBankTransfer();
      } catch (e) {
        toast.error(
          "Sorry to hear that you are facing an issue with Bank Transfer. Please try again later."
        );
      }
    }

    if (isPayhere) {
      await handleCheckout();
      return;
    }

    if (isCashOnDelivery) {
      await handleCheckout();
    }
  };

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const isPayhere =
        formData?.paymentMethod?.selectedGateway?.id == "payhere";

      if (isPayhere) {
        try {
          ImplementPayhere();
          setLoading(true);
          return;
        } catch (e) {
          console.log("Error while creating Payhere:", e);
        }
      }

      const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;

      if (paymentMethodId === undefined) {
        console.error("Payment method ID is undefined");
        toast.error("Payment Method was not chosen.");
        return;
      }

      formData.billingAddress.country = "LK";
      formData.deliveryAddress.country = "LK";

      const shippingMethod = getShippingMethod(shippingTotal);
      const shippingDetails = isStorePickup
        ? {
            ...transformAddress(formData.deliveryAddress),
            address1: "Store Pickup",
            address2: "",
            city: "Store Pickup",
            state: "",
            postcode: "",
          }
        : transformAddress(formData.deliveryAddress);

      const email = formData?.contactInfo?.email;

      const billingDetails = {
        ...transformAddress(formData.billingAddress),
        email: formData?.contactInfo?.email,
      };

      const customerNoteHTML = `
            <p><strong>Customer Email:</strong> ${email}</p>
            <p><strong>Phone Number:</strong> ${
              formData?.contactInfo?.phone
            }</p>
            ${
              isStorePickup
                ? "<p><strong>Pickup Location:</strong> Store</p>"
                : ""
            }
        `;

      const variables = {
        input: {
          paymentMethod: paymentMethodId,
          shippingMethod,
          shipping: shippingDetails,
          billing: billingDetails,
          customerNote: customerNoteHTML,
        },
      };

      const { data } =
        customer?.id === "guest"
          ? await guestCheckout({ variables })
          : await checkoutMutation({ variables });

      const isBankTransfer =
        formData?.paymentMethod?.selectedGateway?.id == "bacs";

      setGuestCheckoutData(data);
      console.log("data just below guest checkout", data);

      if (data) {
        const checkoutDetails = savePaymentDetails(data);
        setPaymentData(checkoutDetails);

        if (isBankTransfer) {
          return checkoutDetails;
        } else {
          toast.success("🌟 Order Placed Successfully! 🚀");
          return null;
        }
      } else {
        toast.error("Something Went Wrong While Checkout");
        return null;
      }
    } catch (error) {
      handleCheckoutError(error);
    } finally {
      setLoading(false);
    }
  };

  const getShippingMethod = (shippingTotal: any) => {
    const methodId = isStorePickup
      ? "pickup_location:0"
      : freeShipping
      ? "wbs:5c9bd062_free_shipping"
      : "wbs:0dd3bc79_weight_based_shipping";

    const methodTitle = isStorePickup
      ? "Store Pickup"
      : freeShipping
      ? "Free Shipping"
      : "Weight Based Shipping";

    const total = isStorePickup ? "0" : shippingTotal;

    return { methodId, methodTitle, total };
  };

  const handleCheckoutError = (error: any) => {
    setLoading(false);
    if (error.message === "Sorry, no session found.") {
      toast.error("No Items to checkout");
    } else {
      toast.error("Failed to create the order: " + error.message);
    }
  };

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const replaceStringinInt = (orderTotalString: any) => {
    const numericString = orderTotalString?.replace(/₨|&nbsp;|,|[^0-9.]/g, "");
    const orderTotalNumber = parseFloat(numericString);
    return orderTotalNumber;
  };
  const numericOrderTotal = replaceStringinInt(orderTotal);
  const threePercentFromTotal = numericOrderTotal * 0.03;
  const taxWithTotal = (numericOrderTotal + threePercentFromTotal).toFixed(2);

  useEffect(() => {
    setTotalWithTax(taxWithTotal);
  }, [taxWithTotal]);

  return (
    <div className="nc-CheckoutPage">
      <Script
        type="text/javascript"
        src={"https://www.payhere.lk/lib/payhere.js"}
        onLoad={() => console.log("PayHere script loaded")}
        onError={() => console.error("Error loading PayHere script")}
      />

      <main className="container py-8 md:py-16 lg:pb-28 lg:pt-20 ">
        <PaymentModal
          handleCheckout={handleCheckout}
          show={showBankTransfer}
          // show={true}
          setShowBankTransfer={setShowBankTransfer}
          setWantToSHowBankTransfer={setWantToSHowBankTransfer}
          paymentDetails={paymentDetails}
          customerEmail={formData?.contactInfo?.email}
        />
        <div className="mb-16">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl ">
            Checkout
          </h2>

          <div className="mt-3 block text-xs font-medium text-slate-700 sm:mt-5 sm:text-sm dark:text-slate-400">
            <Link href={"/#"} className="">
              Homepage
            </Link>
            <span className="mx-1 text-xs sm:mx-1.5">/</span>
            <span className="underline">Checkout</span>
          </div>
        </div>{" "}
        <div className="flex flex-col lg:flex-row">
          {/* Information about user */}
          <div className="flex-1">
            <CheckoutDetails
              tabActive={tabActive}
              setTabActive={(
                value:
                  | "ContactInfo"
                  | "BillingAddress"
                  | "DeliveryAddress"
                  | "PaymentMethod"
                  | "order-cart"
              ) => setTabActive(value)}
              handleScrollToEl={handleScrollToEl}
              updateFormData={updateFormData}
              formData={formData}
              paymentGateways={paymentGateways}
              handleConfirmationChange={handleConfirmationChange}
              setIsStorePickup={setIsStorePickup}
              isStorePickup={isStorePickup}
              setIsCardPayment={setIsCardPayment}
              isCardPayment={isCardPayment}
              totalPayment={numericOrderTotal}
            />
          </div>

          <div className="my-10 flex-shrink-0 border-t border-slate-200 lg:mx-10 lg:my-0 lg:border-l lg:border-t-0 xl:lg:mx-14 2xl:mx-16 dark:border-slate-700 "></div>

          <div id="order-cart" className="w-full lg:w-[36%] ">
            <h3 className="text-lg font-semibold">Order summary</h3>
            <div className="mt-8 divide-y divide-slate-200/70 dark:divide-slate-700 ">
              {cart?.contents?.nodes.map((item, index) => (
                <CartItems
                  index={index}
                  key={index}
                  item={item as any}
                  onQuantityChange={updateCart}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="mt-10 border-t border-slate-200/70 pt-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 ">
              {/* <div>
                                <Label className="text-sm">Discount code</Label>
                                <div className="flex mt-1.5">
                                    <Input sizeClass="h-10 px-4 py-3" className="flex-1" />
                                        Apply
                                    </button>
                                </div>
                            </div> */}

              <div className="mt-4 flex justify-between py-2.5">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: cart?.subtotal || "0.00",
                    }}
                  />
                </span>
              </div>
              {!isStorePickup && (
                <div className="flex justify-between py-2.5">
                  <span>
                    {freeShipping ? `Free Shipping` : `Shipping estimate`}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {freeShipping ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: "0.00",
                        }}
                      />
                    ) : (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: cart?.shippingTotal || "0.00",
                        }}
                      />
                    )}
                  </span>
                </div>
              )}

              {isCardPayment && (
                <div className="flex justify-between py-2.5">
                  <span>Bank Charge 3%</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {/* {JSON.stringify(orderTotal)} */}
                    {/* <span dangerouslySetInnerHTML={{ __html: `₨&nbsp;threePercentFromTotal` || "0.00" }} /> */}
                    <span>Rs {threePercentFromTotal.toFixed(2) || "0.00"}</span>
                  </span>
                </div>
              )}

              {isCardPayment && (
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        `Rs ${new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          numericOrderTotal + threePercentFromTotal
                        )}` || "0.00",
                    }}
                  />
                </div>
              )}

              {!isCardPayment && (
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>
                  <span
                    dangerouslySetInnerHTML={{ __html: orderTotal || "0.00" }}
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-center items-center text-sm text-slate-500 dark:text-slate-400">
              <div className=" relative flex gap-2">
                <Checkbox
                  key={1}
                  label=""
                  name="toc"
                  defaultChecked={isTOC}
                  onChange={handleTOC}
                  sizeClassName="w-4 h-4"
                  className="pt-1"
                />

                <div>
                  <div>By proceeding with your purchase you agree to our </div>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={"/terms-and-conditions"}
                    className="font-medium text-slate-900 underline dark:text-slate-200"
                  >
                    Terms and Conditions
                  </Link>
                  <span>
                    {` `}and{` `}
                  </span>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={"/privacy"}
                    className="font-medium text-slate-900 underline dark:text-slate-200"
                  >
                    Privacy Policy
                  </Link>
                  {` `}.
                </div>
              </div>
            </div>
            <ButtonPrimary
              onClick={handleCheckoutProcess}
              // disabled={
              //   !(
              //     isConfirmed.contactInfo &&
              //     isConfirmed.deliveryAddress &&
              //     isConfirmed.billingAddress &&
              //     isConfirmed.paymentMethod &&
              //     isTOC
              //   )
              // }
              className={`mt-8 w-full bg-primary hover:bg-primary-dark`}
            >
              {loading ? (
                <Loader className="animate-spin text-gray-100 " />
              ) : (
                "Confirm Order"
              )}
            </ButtonPrimary>

            <div className="text-xs space-y-1.5 mt-4 pl-5">
              {confirmOrderErrors.map((error, index) => (
                <div key={index} className="text-red-500">
                  *{error}
                </div>
              ))}
            </div>

            {/*<ButtonPrimary onClick={CreateOrderGuest}>*/}
            {/*    GUEST CHECKOUT*/}
            {/*</ButtonPrimary>*/}

            {/*<ButtonPrimary onClick={ImplementPayhere}>*/}
            {/*    Confirm Order With Payhere*/}
            {/*</ButtonPrimary>*/}

            {/*<ButtonPrimary onClick={ImplementBankTransfer}>*/}
            {/*    Do your Bank Transfer*/}
            {/*</ButtonPrimary>*/}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
