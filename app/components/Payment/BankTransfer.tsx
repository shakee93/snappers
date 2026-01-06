import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import BankDetails from "./BankDetails";
import { PaymentDetailsWithoutUrls } from "@/data/types";
import { Loader } from "lucide-react";
import { useSession } from "@/context/SessionProvider";
import Image from "next/image";
import { sentConfirmation } from "@/components/AddressPageComps/HelperComps";

type BankTransferProps = {
  paymentDetails: PaymentDetailsWithoutUrls;
  handleCheckout: any;
};

const BankTransfer: React.FC<BankTransferProps> = ({
  paymentDetails,
  handleCheckout,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  // const [email, setEmail] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { customer, fetchCustomer } = useSession();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      setFile(fileList[0]);
      setPreviewUrl(URL.createObjectURL(fileList[0]));
    }
  };

  // useEffect(() => {
  //   if (paymentDetails) {
  //     setOrderId(paymentDetails.order_id);
  //   } else {
  //     alert("No payment Details provided for the bank transfer");
  //   }
  // }, [paymentDetails]);

  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    setLoading(true);
    toast.info("Please wait while we process your checkout.");
    event.preventDefault();
    console.log("file", file);
    console.log("previewUrl", previewUrl);
    if (!file) {
      toast.error("Kindly choose a file for uploading.", { duration: 7000 });
      setLoading(false);
      return;
    }

    try {
      // First, try to use the paymentDetails prop that was passed from parent
      console.log("BankTransfer: paymentDetails prop received:", paymentDetails ? "available" : "null/undefined");
      let currentPaymentDetails: PaymentDetailsWithoutUrls | null = paymentDetails || null;

      // If paymentDetails prop is not available, try to get it from handleCheckout
      if (!currentPaymentDetails) {
        if (isCreatingOrder) {
          toast.error("Order is already being created. Please wait...");
          setLoading(false);
          return;
        }
        console.log("Payment details not available from prop, calling handleCheckout...");
        setIsCreatingOrder(true);
        try {
          currentPaymentDetails = await handleCheckout();
          console.log("BankTransfer: handleCheckout() returned:", currentPaymentDetails ? "paymentDetails" : "null");
        } finally {
          setIsCreatingOrder(false);
        }
      } else {
        console.log("BankTransfer: Using paymentDetails from prop");
      }

      console.log("paymentDetails", currentPaymentDetails);

      // Check if paymentDetails is null or undefined
      if (!currentPaymentDetails) {
        toast.error('No payment details provided for the bank transfer. Please try again.');
        setLoading(false);
        return;
      }

      // Check if order_id exists
      if (!currentPaymentDetails.order_id) {
        setLoading(false);
        toast.error("Order not created");
        return;
      }

      let order_id = currentPaymentDetails.order_id;
      let email = currentPaymentDetails.email;
      
      if (currentPaymentDetails.email === undefined) {
        throw new Error("No email found");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("order_id", order_id);

      const response = await fetch(
        "https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("response", response);

      const data = await response.json();

      if (data.message === "File uploaded successfully") {
        setUploadStatus("success");
        toast.success(
          "Upload successful! We'll redirect you to our thank you page. Thank you!"
        );
        if (typeof order_id !== "string") {
          const confirmation = await sentConfirmation(order_id as number);
        }


        if (customer?.id === "guest") {

          const queryParams = new URLSearchParams({
            ...currentPaymentDetails,
            lineItems: JSON.stringify(currentPaymentDetails.lineItems),
          }).toString();

          const redirectUrl = `/checkout/guest_checkout?${queryParams}&ordermethod=guest`;
          router.push(redirectUrl);
          return;
        } else {
          let redirectUrl = `checkout/${order_id}`;
          router.push(redirectUrl);
        }
      }

      if (data.error) {
        toast.error("An issue occurred during the bank slip upload process.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      setUploadStatus("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="">
      {/* <div>{JSON.stringify(paymentDetails)}</div> */}

      <h1 className="text-3xl text-center font-bold pb-8">
        Direct Bank Transfer
      </h1>
      <div className="container grid sm:grid-cols-2 grid-cols-1 sm:divide-x-2 sm:divide-y-0 divide-y-2 mx-auto p-4">
        <BankDetails />
        <form
          className="file-upload-form sm:pl-8  w-fit"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <p className="text-2xl font-bold text-left pb-4">
              Upload Bank Slip
            </p>
            <input
              className=""
              id="file"
              type="file"
              required={true}
              onChange={handleFileChange}
              accept="image/png, image/gif, image/jpeg, image/heic, image/heif, image/webp, image/bmp, image/tiff"
            />
            {previewUrl && (
              <div className="pt-4">
                <p className="text-sm pt-2 text-gray-600">Preview:</p>
                {/* <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 w-full max-h-52 object-contain h-auto"
                /> */}

                <Image
                  src={previewUrl}
                  alt="Preview"
                  layout="responsive"
                  width={500}
                  height={200}
                  className="mt-2 w-full max-h-52 object-contain h-auto"
                />
              </div>
            )}
            <p className="text-sm pt-2 text-gray-600">
              When you{`'`}ve completed the transfer to Our Bank, kindly upload
              your bank slip here.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <ButtonPrimary
              className={
                !file
                  ? "cursor-not-allowed bg-blue-500  w-full opacity-75 hover:bg-blue-700 text-white font-bold py-2 px-4"
                  : "bg-blue-500  w-full hover:bg-blue-700 text-white font-bold py-2 px-4"
              }
              type="submit"
              disabled={loading || !file}
            >
              {loading ? (
                <Loader className="animate-spin text-gray-100 " />
              ) : (
                "Confirm Slip & Checkout"
              )}
            </ButtonPrimary>
          </div>
        </form>
      </div>
      <div>
        <div className="text-red-900 rounded-2xl font-medium px-8 bg-red-100 text-center  text-xl py-8">
          Please note,{" "}
          <span className="font-semibold">orders will be canceled</span> if the
          slip is not uploaded within 30 minutes or if you leave the page
          without uploading.
        </div>
      </div>
    </div>
  );
};

export default BankTransfer;
