// BankTransfer.tsx
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {Input} from "@nextui-org/react";
import {useRouter} from "next/navigation";
import React, {FormEvent, useEffect, useState} from "react";
import toast from "react-hot-toast";
import BankDetails from "./BankDetails";
import {PaymentDetailsWithoutUrls} from "@/data/types";

type BankTransferProps = {
  // Define any props you expect to pass into BankTransfer here
  paymentDetails: PaymentDetailsWithoutUrls;
};

const BankTransfer: React.FC<BankTransferProps> = ({paymentDetails}) => {
  const [file, setFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      setFile(fileList[0]);
    }
  };

  const handleOrderIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(event.target.value);

  };
  useEffect(() => {
    if (paymentDetails) {
      setOrderId(paymentDetails.order_id);
    }else{
      alert("No payment Details provided for the bank transfer")
    }
  }, [paymentDetails]);

  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("order_id", orderId);

    try {
      const response = await fetch("/api/banktransfer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("data", data);

      if (data.message === "succuss") {
        setUploadStatus("succuss");
        router.push("/thank-you");
      }
      if (data.error) {
        setUploadStatus("wrong");
        toast.error("Something Went Wrong");
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container grid sm:grid-cols-2 grid-cols-1 sm:divide-x-2 sm:divide-y-0 divide-y-2 mx-auto p-4">
      <BankDetails />
      <form className="file-upload-form sm:pl-8 w-fit" onSubmit={handleSubmit}>
        <div className="mb-4">
          <h1
            className="text-xl sm:py-8 py-4 text-left"

          >
            Upload Bank Slip
          </h1>
          <Input
            className=""
            id="file"
            type="file"
            onChange={handleFileChange}
          />
          <p className="text-sm pt-2 text-gray-600">When you{`'`}ve completed the transfer to Our Bank, kindly upload your bank slip here</p>
        </div>

        <div className="flex items-center justify-between">
          <ButtonPrimary
            className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Upload
          </ButtonPrimary>
        </div>
        {uploadStatus && <p className="text-center my-4">{uploadStatus}</p>}
      </form>
    </div>
  );
};

export default BankTransfer;
