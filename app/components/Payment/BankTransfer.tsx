// BankTransfer.tsx
import React, { useState, FormEvent } from 'react';

type BankTransferProps = {
  // Define any props you expect to pass into BankTransfer here
};

const BankTransfer: React.FC<BankTransferProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      setFile(fileList[0]);
    }
  };

  const handleOrderIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(event.target.value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_id', orderId);

    try {
      const response = await fetch('http://52.45.14.64/api/gq_mobile/v1', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.message === 'File uploaded successfully') {
        setUploadStatus('File uploaded successfully!');
      } else {
        setUploadStatus('File upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form className="file-upload-form" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            Upload Receipt
          </label>
          <input className="shadow border rounded py-2 px-3 text-gray-700" id="file" type="file" onChange={handleFileChange} />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order_id">
            Order ID
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight" id="order_id" type="text" value={orderId} onChange={handleOrderIdChange} />
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
            Upload
          </button>
        </div>
        {uploadStatus && <p className="text-center my-4">{uploadStatus}</p>}
      </form>
    </div>
  );
};

export default BankTransfer;
