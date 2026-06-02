"use client";
import { Loader, ShoppingCart, Clock } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  ProductTag,
} from "@/graphql/types/graphql";
import NcInputNumber from "@/components/primitives/NcInputNumber";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import AddedToCart from "@/components/ui/Notifications/added-to-cart";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import Input from "shared/Input/Input";
import PreOrderNotice from "@/components/ui/PreOrderNotice";

interface ProductAddToCartProps {
  product: SimpleProduct & VariableProduct;
  variation: ProductVariation & { rawPrice: string };
}

const ProductAddToCart: React.FC<ProductAddToCartProps> = ({ product, variation }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const { addToCart, cart } = useCart();
  const router = useRouter();
  const { customer, fetchCustomer } = useSession();
  const [isNotifyClicked, setIsNotifyClicked] = useState(false);
  const [userEmail, setUserEmail] = useState(customer?.email || ""); // Track user's email
  const [isThankYouModal, setIsThankYouModal] = useState(false); // Track thank you modal visibility
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const sendNotificationRequest = async () => {
    try {
      const response = await fetch("/api/emailnotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          xoo_wl_user_email: userEmail || "",
          _xoo_wl_product_id: variation?.databaseId ?? product.databaseId,
          xoo_wl_required_qty: "1",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsThankYouModal(true);
        toast.success("You've been added to the notification list!");
      } else {
        const errorData = await response.json();
        console.error("Error data:", errorData);

        // Handle specific error responses
        if (response.status === 400) {
          toast.error("Invalid email address. Please check and try again.");
        } else if (response.status === 500) {
          toast.error("Server error occurred. Please try again later.");
        } else {
          toast.error("Unable to add you to the notification list. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Fetch error:", error);

      // Handle network errors
      if (error.message?.includes("fetch") || error.message?.includes("network")) {
        toast.error("Unable to connect to the server. Please check your internet connection and try again.");
      } else if (error.message?.includes("timeout")) {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleNotifyClick = async () => {
    // console.log("Notify button clicked", customer?.email);

    if (userEmail) {

      // console.log("Email submitted:", userEmail);

      try {
        sendNotificationRequest();
      }
      catch (error) {
        console.error("Fetch error:", error);
      } finally {
        onOpen();
        setIsNotifyClicked(true);
      }
      setIsThankYouModal(true);
      onOpenChange();
      setTimeout(onOpen, 500);
    }

    onOpen();
  };

  const handleSubmitEmail = async () => {

    if (userEmail) {

      // console.log("Email submitted:", userEmail);

      try {
        sendNotificationRequest();
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        onOpen();
        setIsNotifyClicked(true);
      }
      setIsThankYouModal(true);
      onOpenChange();
      setTimeout(onOpen, 500);
    } else {
      // console.log('no customer email');
    }
  };

  const notifyAddToCart = (quantity: number) => {
    toast(
      <div>
        <div className="flex items-center justify-between text-base font-semibold leading-none">
          Added to cart!
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
        <AddedToCart product={product} variation={variation} quantity={quantity} />
      </div>,
      {
        duration: 2000,
      }
    );
  };

  const handleCartCompletion = () => {
    setQuantity(1);
  };

  const getVariationId = () => {
    return product.type === "SIMPLE" ? undefined : variation.databaseId;
  };

  const isProductOutOfStock = () => {
    if (product.type === "VARIABLE") {
      return variation?.stockStatus !== "IN_STOCK";
    }
    return product?.stockStatus !== "IN_STOCK";
  };

  const isDesiredQuantityAvailable = () => {
    const cartItems = cart?.contents?.nodes ?? [];
    const existingCartItem = cartItems.find((item: any) =>
      product.type === "VARIABLE"
        ? item.variation?.node?.databaseId === variation?.databaseId
        : item.product?.node?.databaseId === product.databaseId
    );

    const existingCartQuantity = existingCartItem?.quantity ?? 0;
    const desiredQuantity = existingCartQuantity + quantity;


    const availableStock =
      product.type === "VARIABLE"
        ? variation?.stockQuantity
        : product?.stockQuantity;


    if (availableStock === null || availableStock === undefined) {
      return true
    }


    if (availableStock < desiredQuantity) {
      const message =
        product.type === "VARIABLE"
          ? "Added the maximum stock quantity to cart. Stock levels are low."
          : "Stock quantity maximum added";

      toast.error(message);
      return false;
    }

    return true;
  };

  const addItemToCart = async () => {
    if (isProductOutOfStock()) {
      return;
    }

    if (!isDesiredQuantityAvailable()) {
      return;
    }

    setLoading(true);
    const variationId = getVariationId();

    try {
      const { data, error } = await addToCart(
        product?.databaseId,
        quantity,
        variationId,
        product // Pass product data for pre-order validation
      );

      handleAddToCartResponse(data, error);
    } catch (error: any) {

      handleAddToCartError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartResponse = (data: any, error: any) => {
    if (!error && !data?.error) {
      handleCartCompletion();
      // notifyAddToCart(quantity);
    }
  };

  const handleAddToCartError = (error: any) => {
    // console.log('error', error);

    // Handle token expiration
    const isTokenExpired =
      error.graphQLErrors?.[0]?.extensions?.debugMessage === "invalid-secret-key | Expired token" ||
      error.graphQLErrors?.[0]?.extensions?.message?.includes("Expired token");

    if (isTokenExpired) {
      toast.error("You've been logged out. Please sign in again.");
      router.push("/login");
      return;
    }

    // Handle network errors
    if (error.networkError) {
      toast.error("Unable to connect to the server. Please check your internet connection and try again.");
      return;
    }

    // Handle GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      const errorMessage = graphQLError.message || graphQLError.extensions?.message;

      // Handle specific GraphQL error cases
      if (errorMessage?.includes("out of stock") || errorMessage?.includes("stock")) {
        toast.error("This product is currently out of stock. Please try again later.");
        return;
      }

      if (errorMessage?.includes("cart") || errorMessage?.includes("add")) {
        toast.error("Unable to add item to cart. Please try again.");
        return;
      }

      if (errorMessage?.includes("permission") || errorMessage?.includes("unauthorized")) {
        toast.error("You don't have permission to perform this action. Please login and try again.");
        return;
      }

      // Generic GraphQL error
      toast.error("Something went wrong while adding the item to your cart. Please try again.");
      return;
    }

    // Handle generic errors
    if (error.message) {
      // Check for common error patterns
      if (error.message.includes("fetch") || error.message.includes("network")) {
        toast.error("Unable to connect to the server. Please check your internet connection and try again.");
        return;
      }

      if (error.message.includes("timeout")) {
        toast.error("The request timed out. Please try again.");
        return;
      }

      if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
        toast.error("Server error occurred. Please try again in a few moments.");
        return;
      }

      if (error.message.includes("404") || error.message.includes("Not Found")) {
        toast.error("Product not found. Please refresh the page and try again.");
        return;
      }

      // For other specific errors, show the message but make it more user-friendly
      toast.error(`Unable to add item to cart: ${error.message}`);
      return;
    }

    // Fallback for unknown errors
    toast.error("An unexpected error occurred. Please try again or contact support if the problem persists.");
  };

  const isPreOrderProduct = () => {
    return product.productTags?.nodes?.some(
      (tag: ProductTag) => tag.slug === 'pre-order'
    ) || false;
  };



  const isAddToCartDisabled =
    loading ||
    variation?.rawPrice === "0.00" ||
    variation?.rawPrice == null ||
    isProductOutOfStock();

  // console.log('isAddToCartDisabled', isAddToCartDisabled);
  // console.log('product', product);
  // console.log('variation', variation);

  return (
    <div className="w-full">
      {/* Pre-order Notice */}
      {isPreOrderProduct() && (
        <PreOrderNotice className="mb-4" />
      )}

      <div
        className="flex items-center justify-center md:justify-start gap-4 md:gap-0 md:space-x-3.5 py-2 px-2 md:py-4 fixed bottom-[82px] left-0 z-10 md:z-10 bg-white md:bg-transparent w-full md:static"
      >
        {!(product.type === "VARIABLE" && !variation) && (
          <div className="flex border border-primary-500/20 items-center justify-center dark:bg-slate-800/70 px-2 py-1 sm:p-2 rounded-full">
            <div className="flex items-center justify-between space-x-5 w-full">
              <NcInputNumber onChange={(v) => setQuantity(v)} defaultValue={quantity} />
            </div>
          </div>
        )}


        {(product.type === "SIMPLE" && product.stockStatus === "IN_STOCK") ||
          (product.type === "VARIABLE" && !isProductOutOfStock()) ? (
          <button
            disabled={isAddToCartDisabled}
            onClick={addItemToCart}
            className={twMerge(
              "relative w-auto grow md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90",
              isPreOrderProduct()
                ? "bg-blue-800 dark:bg-slate-100 text-slate-50 dark:text-slate-800"
                : "bg-primary-500 dark:bg-slate-100 text-slate-50 dark:text-slate-800",
              "shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0",
              isAddToCartDisabled && "opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? <Loader className="animate-spin" /> : (
              isPreOrderProduct() ? (
                <Clock className="w-5 h-5" />
              ) : (
                <ShoppingCart />
              )
            )}
            <span className="md:ml-3 cursor-pointer">
              {isPreOrderProduct() ? "Pre-order Now" : "Add to cart"}
            </span>
          </button>
        ) : (
          <button
            disabled={isNotifyClicked}
            onClick={handleNotifyClick}
            className={twMerge(
              "relative w-auto grow md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primary-500 dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0",
              isNotifyClicked && "opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Notify Me When Available
          </button>
        )}


        {/* Modal Implementation */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          scrollBehavior="inside"
          placement="center"
          className="max-w-[90vw] w-full sm:max-w-lg mx-4"
        >
          <ModalContent>
            {(onClose) => (
              <>
                {!isThankYouModal ? (
                  <>
                    <ModalHeader className="flex flex-row gap-2 px-6 py-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
                      </svg>
                      Notify Me
                    </ModalHeader>
                    <ModalBody className="py-0 max-h-[60vh] overflow-y-auto">
                      {customer?.email ? (
                        <p>Thank you! You will be notified when the product is back in stock.</p>
                      ) : (
                        <>
                          <p>Please enter your email to be notified when the product is back in stock.</p>
                          <input
                            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 dark:border-neutral-600 dark:bg-neutral-800 
                          dark:text-white transition duration-200 ease-in-out"
                            type="email"
                            value={userEmail}
                            placeholder="Enter Email"
                            onChange={(e) => setUserEmail(e.target.value)}
                            required
                          />
                        </>
                      )}
                    </ModalBody>
                    <ModalFooter>
                      <Button className="bg-transparent text-red-500 hover:bg-black hover:text-white transition-colors duration-200 ease-in-out"
                        onPress={onClose}>
                        Close
                      </Button>
                      {!customer?.email && (
                        <Button className="bg-transparent text-primary-500 hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out"
                          onPress={handleSubmitEmail}>
                          Submit
                        </Button>
                      )}
                    </ModalFooter>
                  </>
                ) : (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Thank You</ModalHeader>
                    <ModalBody className="max-h-[60vh] overflow-y-auto">
                      <p>You will be notified when the product is back in stock!</p>
                    </ModalBody>
                    <ModalFooter>
                      <Button className="bg-transparent text-blue-500 hover:bg-black hover:text-white transition-colors duration-200 ease-in-out"
                        onPress={onClose}>
                        Close
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </>
            )}
          </ModalContent>
        </Modal>

      </div>
    </div>
  );
};

export default ProductAddToCart;