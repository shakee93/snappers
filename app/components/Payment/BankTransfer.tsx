// BankTransfer.tsx
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import BankDetails from "./BankDetails";
import { PaymentDetailsWithoutUrls } from "@/data/types";
import { Loader } from "lucide-react";

type BankTransferProps = {
  // Define any props you expect to pass into BankTransfer here
  paymentDetails: PaymentDetailsWithoutUrls;
};

const BankTransfer: React.FC<BankTransferProps> = ({ paymentDetails }) => {
  const [file, setFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [loading, setLoading] = useState(false)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      setFile(fileList[0]);
    }
  };

  useEffect(() => {

    // use this id to the testing
    // setOrderId("6445");
    if (paymentDetails) {
      setOrderId(paymentDetails.order_id);
    } else {
      alert("No payment Details provided for the bank transfer")
    }
  }, [paymentDetails]);

  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    setLoading(true)
    event.preventDefault();
    if (!file) {
      toast.error("Kindly choose a file for uploading.", { duration: 7000 });

      setLoading(false)
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("order_id", orderId);

    try {
      const response = await fetch("/api/gq_mobile/v1/upload", {
        method: "POST",
        body: formData,
      });
      

      const data = await response.json();

      console.log("data", data);

      if (data.message === "success") {
        setUploadStatus("success");
        toast.success("You have successfully completed the upload of your bank slip.")
        let thankYouUrl = `checkout/${orderId}`
        router.push(thankYouUrl);
      }

      if (data.error) {
        toast.error("An issue occurred during the bank slip upload process.");
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Error:", error);
      setUploadStatus("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container grid sm:grid-cols-2 grid-cols-1 sm:divide-x-2 sm:divide-y-0 divide-y-2 mx-auto p-4">
      <BankDetails />
      <form className="file-upload-form sm:pl-8 py-8 w-fit" onSubmit={handleSubmit}>
        <div className="mb-4">
          {/*<h1*/}
          {/*    className="text-xl sm:py-8 py-4 text-left"*/}

          {/*>*/}
          {/*  Upload Bank Slip*/}
          {/*</h1>*/}
          <p className="text-2xl font-bold text-left pb-4">Upload Bank Slip</p>
          <input
            className=""
            id="file"
            type="file"
            required={true}
            onChange={handleFileChange}
            accept="image/png, image/gif, image/jpeg, image/heic, image/heif, image/webp, image/bmp, image/tiff" />

          <p className="text-sm pt-2 text-gray-600">When you{`'`}ve completed the transfer to Our Bank, kindly upload
            your bank slip here.</p>
        </div>

        <div className="flex items-center justify-between">
          <ButtonPrimary
            className="bg-blue-500  w-full hover:bg-blue-700 text-white font-bold py-2 px-4"
            type="submit"
            disabled={loading}
          >
            {loading ?
              (
                <Loader className='animate-spin text-gray-100 ' />
              )

              : 'Upload'}
          </ButtonPrimary>
        </div>
        {/*{uploadStatus && <p className="text-center my-4">{uploadStatus}</p>}*/}
      </form>
    </div>
  );
};

export default BankTransfer;
