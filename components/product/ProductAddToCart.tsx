"use client";
import { Loader, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import WishlistButton from "@/components/product/WishlistButton";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  ProductTag,
} from "@/graphql/types/graphql";
import React, { useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import PreOrderNotice from "@/components/global/ui/PreOrderNotice";
import { pdpRadius } from "@/components/product/pdpStyles";

interface ProductAddToCartProps {
  product: SimpleProduct & VariableProduct;
  variation?: (ProductVariation & { rawPrice?: string | null }) | null;
}

const ProductAddToCart: React.FC<ProductAddToCartProps> = ({ product, variation }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [loadingAction, setLoadingAction] = useState<"cart" | "buy" | null>(
    null,
  );
  const { addToCart, cart } = useCart();
  const router = useRouter();
  const { customer } = useSession();
  const [isNotifyClicked, setIsNotifyClicked] = useState(false);
  const [userEmail, setUserEmail] = useState(customer?.email || ""); // Track user's email
  const [isThankYouModal, setIsThankYouModal] = useState(false); // Track thank you modal visibility
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const loading = loadingAction !== null;

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
    } catch (error: unknown) {
      console.error("Fetch error:", error);
      const message = error instanceof Error ? error.message : "";

      // Handle network errors
      if (message.includes("fetch") || message.includes("network")) {
        toast.error("Unable to connect to the server. Please check your internet connection and try again.");
      } else if (message.includes("timeout")) {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleNotifyClick = async () => {
    if (userEmail) {
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
    }

    onOpen();
  };

  const handleSubmitEmail = async () => {
    if (userEmail) {
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
    }
  };

  const handleCartCompletion = () => {
    setQuantity(1);
  };

  const getVariationId = () => {
    return product.type === "SIMPLE" ? undefined : variation?.databaseId;
  };

  const isProductOutOfStock = () => {
    if (product.type === "VARIABLE") {
      return variation?.stockStatus !== "IN_STOCK";
    }
    return product?.stockStatus !== "IN_STOCK";
  };

  const rawPrice =
    product.type === "SIMPLE"
      ? (product as SimpleProduct & { rawPrice?: string | null }).rawPrice
      : variation?.rawPrice;

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

  const addItemToCart = async (redirectToCheckout = false) => {
    if (isProductOutOfStock()) {
      return;
    }

    if (!isDesiredQuantityAvailable()) {
      return;
    }

    setLoadingAction(redirectToCheckout ? "buy" : "cart");
    const variationId = getVariationId();

    try {
      const result = await addToCart(
        product?.databaseId,
        quantity,
        variationId,
        product,
        { openCart: !redirectToCheckout },
      );

      if (!result || ("error" in result && result.error)) {
        setLoadingAction(null);
        return;
      }

      handleCartCompletion();
      if (redirectToCheckout) {
        router.push("/checkout");
        // Keep the Buy Now spinner until the route swap so a second click
        // cannot queue another add while checkout is still loading.
        return;
      }

      setLoadingAction(null);
    } catch (error: unknown) {
      handleAddToCartError(error);
      setLoadingAction(null);
    }
  };

  const handleAddToCartError = (error: unknown) => {
    const err = error as {
      graphQLErrors?: Array<{
        message?: string;
        extensions?: { debugMessage?: string; message?: string };
      }>;
      networkError?: unknown;
      message?: string;
    };

    const isTokenExpired =
      err.graphQLErrors?.[0]?.extensions?.debugMessage === "invalid-secret-key | Expired token" ||
      err.graphQLErrors?.[0]?.extensions?.message?.includes("Expired token");

    if (isTokenExpired) {
      toast.error("You've been logged out. Please sign in again.");
      router.push("/login");
      return;
    }

    // Handle network errors
    if (err.networkError) {
      toast.error("Unable to connect to the server. Please check your internet connection and try again.");
      return;
    }

    // Handle GraphQL errors
    if (err.graphQLErrors && err.graphQLErrors.length > 0) {
      const graphQLError = err.graphQLErrors[0];
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
    if (err.message) {
      if (err.message.includes("fetch") || err.message.includes("network")) {
        toast.error("Unable to connect to the server. Please check your internet connection and try again.");
        return;
      }

      if (err.message.includes("timeout")) {
        toast.error("The request timed out. Please try again.");
        return;
      }

      if (err.message.includes("500") || err.message.includes("Internal Server Error")) {
        toast.error("Server error occurred. Please try again in a few moments.");
        return;
      }

      if (err.message.includes("404") || err.message.includes("Not Found")) {
        toast.error("Product not found. Please refresh the page and try again.");
        return;
      }

      toast.error(`Unable to add item to cart: ${err.message}`);
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
    rawPrice === "0.00" ||
    rawPrice == null ||
    rawPrice === "" ||
    isProductOutOfStock();

  const cardControlClass =
    `flex h-12 items-center justify-center border border-[#E8E8E8] bg-white ${pdpRadius}`;

  const isInStock =
    (product.type === "SIMPLE" && product.stockStatus === "IN_STOCK") ||
    (product.type === "VARIABLE" && !!variation && !isProductOutOfStock());

  const renderQuantityControl = () => (
    <div
      className={`${cardControlClass} min-w-[112px] shrink-0 justify-between gap-2 px-2 sm:min-w-[136px] sm:gap-4 sm:px-4`}
    >
      <button
        type="button"
        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
        disabled={quantity <= 1}
        className="flex h-8 w-8 items-center justify-center text-[#374151] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-5 w-5" />
      </button>
      <span className="min-w-6 text-center text-base font-semibold text-[#1A1A1A]">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity((current) => current + 1)}
        className="flex h-8 w-8 items-center justify-center text-[#374151]"
        aria-label="Increase quantity"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );

  const renderAddToCartButton = () => (
    <button
      type="button"
      disabled={isAddToCartDisabled}
      onClick={() => addItemToCart(false)}
      aria-label={isPreOrderProduct() ? "Pre-order" : "Add to Cart"}
      className={twMerge(
        `flex h-12 min-w-0 flex-1 items-center justify-center px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base ${pdpRadius}`,
      )}
      style={{ backgroundColor: "#3BB77E" }}
    >
      {loadingAction === "cart" ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : isPreOrderProduct() ? (
        "Pre-order"
      ) : (
        <>
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add to Cart</span>
        </>
      )}
    </button>
  );

  const renderSecondaryRow = () => (
    <div className="mt-3">
      <WishlistButton
        productId={product.databaseId}
        className={`${cardControlClass} h-11 w-full gap-2 px-3 text-sm font-semibold text-neutral-700`}
        showLabel
      />
    </div>
  );

  return (
    <div className="w-full">
      {isPreOrderProduct() && <PreOrderNotice className="mb-4" />}

      <div className="fixed bottom-[82px] left-0 z-40 w-full border-t border-[#E8E8E8] bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        {!(product.type === "VARIABLE" && !variation) && (
          <div className="lg:pb-4">
            {isInStock ? (
              <>
                <div className="flex items-stretch gap-3">
                  {renderQuantityControl()}
                  {renderAddToCartButton()}
                </div>
                {renderSecondaryRow()}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={isNotifyClicked}
                  onClick={handleNotifyClick}
                  className={`${cardControlClass} h-12 min-w-0 flex-1 px-4 text-sm font-bold text-[#253D4E] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Notify Me
                </button>
                {renderSecondaryRow()}
              </div>
            )}
          </div>
        )}
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