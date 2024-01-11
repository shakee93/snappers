// BankTransfer.tsx
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Input } from "@nextui-org/react";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";
import toast from "react-hot-toast";

type BankTransferProps = {
  // Define any props you expect to pass into BankTransfer here
};

const BankTransfer: React.FC<BankTransferProps> = () => {
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
      
      console.log("data",data)

      if (data.message === "succuss") {
        setUploadStatus("succuss");
        router.push('/thank-you')
      }
      if(data.error) {
        setUploadStatus("wrong");
        toast.error("Something Went Wrong")
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form className="file-upload-form w-fit" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="file"
          >
            Upload Bank Slip
          </label>
          <Input
            className=""
            id="file"
            type="file"
            onChange={handleFileChange}
            
          />

        </div>
   
        <div className="flex items-center justify-between">
          <ButtonPrimary
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
