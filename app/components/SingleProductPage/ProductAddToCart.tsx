"use client";
import { Loader, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  ProductTag,
} from "@/graphql/types/graphql";
import NcInputNumber from "@/components/NcInputNumber";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import AddedToCart from "@/app/components/Notifications/added-to-cart";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import Input from "shared/Input/Input";

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
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
  const [preOrderEmail, setPreOrderEmail] = useState(customer?.email || "");
  const [preOrderLoading, setPreOrderLoading] = useState(false);
  const [preOrderUsername, setPreOrderUsername] = useState("");
  const [preOrderPhone, setPreOrderPhone] = useState("");

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
          _xoo_wl_product_id: variation.databaseId,
          xoo_wl_required_qty: "1",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsThankYouModal(true);
      } else {
        const errorData = await response.json();
        console.error("Error data:", errorData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
    const existingCartItem = cartItems.find(
      (item: any) => item.product.node.databaseId === product.databaseId
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
        variationId
      );

      handleAddToCartResponse(data, error);
    } catch (error: any) {

      handleAddToCartError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartResponse = (data: any, error: any) => {
    if (!error) {
      handleCartCompletion();
    }
  
  };

  const handleAddToCartError = (error: any) => {
    console.log("add to cart error", error);


    const isTokenExpired = 
      error.graphQLErrors?.[0]?.debugMessage === "invalid-secret-key | Expired token" ||
      error.graphQLErrors?.[0]?.message?.includes("Expired token");

    if (isTokenExpired) {
      toast.error("You've been logged out. Please sign in again.");
      router.push("/login");
      return;
    }

    toast.error("Something went wrong! Please login again.");
    return
  };

  const isPreOrderProduct = () => {
    return product.productTags?.nodes?.some(
      (tag: ProductTag) => tag.slug === 'pre-order'
    ) || false;
  };

  const handlePreOrder = () => {
    setIsPreOrderModalOpen(true);
  };

  const handlePreOrderSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPreOrderLoading(true);
    try {
      const res = await fetch("https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: preOrderEmail,
          username: preOrderUsername,
          phone: preOrderPhone,
          quantity,
          product_id: product.databaseId,
        }),
      });
      if (!res.ok) throw new Error("Failed to place pre-order");
      toast.success("Pre-order placed successfully!");
      console.log("Pre-order placed successfully!");
      setIsPreOrderModalOpen(false);
    } catch (err) {
      console.log("Failed to place pre-order. Please try again.", err);
      toast.error("Failed to place pre-order. Please try again.");
    } finally {
      setPreOrderLoading(false);
    }
  };

  const isAddToCartDisabled =
    loading ||
    variation?.rawPrice === "0.00" ||
    variation?.rawPrice == null ||
    isProductOutOfStock();

  // console.log('isAddToCartDisabled', isAddToCartDisabled);
  // console.log('product', product);
  // console.log('variation', variation);

  if (product.type === "VARIABLE" && !variation) {
    return (
      <button
        className={twMerge(
          "relative w-auto my-8 grow bg-gray-600 md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
          "opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <span className=" cursor-pointer">Not Available</span>
      </button>
    )
  }

  return (
    <div
      className="flex items-center justify-center md:justify-start gap-4 md:gap-0 md:space-x-3.5 py-2 px-2 md:py-4 fixed bottom-[82px] left-0 z-10 md:z-10 bg-white md:bg-transparent w-full md:static"
    >
      <div className="flex border border-primaryColor/20 items-center justify-center dark:bg-slate-800/70 px-2 py-1 sm:p-2 rounded-full">
        <div className="flex items-center justify-between space-x-5 w-full">
          <NcInputNumber onChange={(v) => setQuantity(v)} defaultValue={quantity} />
        </div>
      </div>


      {(product.type === "SIMPLE" && product.stockStatus === "IN_STOCK") ||
        (product.type === "VARIABLE" && !isProductOutOfStock()) ? (
        isPreOrderProduct() ? (
          <>
            <button
              onClick={handlePreOrder}
              className="relative w-auto grow md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-blue-800 dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0"
            >
              <span className=" cursor-pointer">
                Pre-order Now
              </span>
            </button>
            <Modal isOpen={isPreOrderModalOpen} onOpenChange={setIsPreOrderModalOpen}>
              <ModalContent>
                <form onSubmit={handlePreOrderSubmit}>
                  <ModalHeader className="flex flex-col gap-1">Pre-order Product</ModalHeader>
                  <ModalBody>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Email
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={preOrderEmail}
                        onChange={e => setPreOrderEmail(e.target.value)}
                        required
                      />
                    </label>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Username
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={preOrderUsername}
                        onChange={e => setPreOrderUsername(e.target.value)}
                        required
                      />
                    </label>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Phone
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={preOrderPhone}
                        onChange={e => setPreOrderPhone(e.target.value)}
                        required
                      />
                    </label>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Quantity
                      <Input
                        type="number"
                        min={1}
                        placeholder="Quantity"
                        value={quantity.toString()}
                        onChange={e => setQuantity(Number(e.target.value))}
                        required
                      />
                    </label>
                  </ModalBody>
                  <ModalFooter>
                    <Button type="button" variant="light" onPress={() => setIsPreOrderModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" color="primary" isLoading={preOrderLoading} disabled={preOrderLoading}>
                      Place Pre-order
                    </Button>
                  </ModalFooter>
                </form>
              </ModalContent>
            </Modal>
          </>
        ) : (
          <button
            disabled={isAddToCartDisabled}
            onClick={addItemToCart}
            className={twMerge(
              "relative w-auto grow md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primaryColor dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
              isAddToCartDisabled && "opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? <Loader className="animate-spin" /> : <ShoppingCart />}
            <span className="md:ml-3 cursor-pointer">
              Add to cart
            </span>
          </button>
        )
      ) : (
        <button
          disabled={isNotifyClicked}
          onClick={handleNotifyClick}
          className={twMerge(
            "relative w-auto grow md:flex-none h-auto inline-flex cursor-pointer items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primaryColor dark:bg-slate-100 text-slate-50 dark:text-slate-800 shadow-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0",
            isNotifyClicked && "opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Notify Me When Available
        </button>
      )}


      {/* Modal Implementation */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
                  <ModalBody className="py-0">
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
                      <Button className="bg-transparent text-primaryColor hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out"
                        onPress={handleSubmitEmail}>
                        Submit
                      </Button>
                    )}
                  </ModalFooter>
                </>
              ) : (
                <>
                  <ModalHeader className="flex flex-col gap-1">Thank You</ModalHeader>
                  <ModalBody>
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
  );
};

export default ProductAddToCart;