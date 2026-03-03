"use client";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

type OrderBankReceiptUploadProps = {
  orderNumber: string;
  orderId: string;
  onUploadSuccess?: () => void;
};

const OrderBankReceiptUpload: React.FC<OrderBankReceiptUploadProps> = ({
  orderNumber,
  orderId,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      setFile(fileList[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    setLoading(true);
    event.preventDefault();

    if (!file) {
      toast.error("Kindly choose a file for uploading.", { duration: 7000 });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("order_id", orderId);

      const response = await fetch(
        "https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.message === "File uploaded successfully") {
        setUploadStatus("success");
        toast.success("Bank receipt uploaded successfully!");
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById(`file-${orderNumber}`) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else if (data.error) {
        toast.error("An issue occurred during the bank slip upload process.");
        setUploadStatus("error");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      toast.error("An error occurred. Please try again later.");
      setUploadStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-flex items-center gap-2 mt-2">
      <input
        id={`file-${orderNumber}`}
        type="file"
        required={true}
        onChange={handleFileChange}
        accept="image/png, image/gif, image/jpeg, image/heic, image/heif, image/webp, image/bmp, image/tiff"
        className="text-xs text-gray-600 dark:text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
      />
      <button
        type="submit"
        disabled={loading || !file}
        className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
          loading || !file
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {loading ? (
          <Loader className="animate-spin h-3 w-3" />
        ) : (
          "Upload"
        )}
      </button>
      {uploadStatus === "success" && (
        <span className="text-xs text-green-600 dark:text-green-400">✓ Uploaded</span>
      )}
    </form>
  );
};

export default OrderBankReceiptUpload;
