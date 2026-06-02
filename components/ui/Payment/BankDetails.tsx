import React, {useState} from 'react';
import {siteConfig} from '@/site.config';

const bankDetailsData = siteConfig.payment.bankAccounts;
type BankDetail = (typeof bankDetailsData)[number];

const BankDetails: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState(0);

  const handleBankSelect = (index: number) => {
    setSelectedBank(index);
  };

  const renderBankTabs = () => (
      <div className="flex flex-wrap gap-2">
        {bankDetailsData.map((bank: BankDetail, index: number) => (
            <div
                key={index}
                className={`cursor-pointer py-2 rounded-lg px-4 ${
                    selectedBank === index ? 'bg-blue-700 text-white' : 'bg-gray-100'
                }`}
                onClick={() => handleBankSelect(index)}
            >
              {bank.bank}
            </div>
        ))}
      </div>
  );

  const selectedBankDetails = bankDetailsData[selectedBank];

  return (
      <div className="">
        <p className="text-2xl font-bold text-left">Our Bank Details</p>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">{renderBankTabs()}</div>
          <div className="mt-4">
            <h1 className="text-xl py-2 text-left">{selectedBankDetails.bank}</h1>
            <ul className="list-disc pl-4">
              {Object.entries(selectedBankDetails)
                  .filter(([label]) => label !== 'featuredAtCheckout')
                  .map(([label, value]) => (
                  <li key={label} className="mb-2 text-left">
                    <strong className="text-gray-600">{label}:</strong> {value}
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
};

export default BankDetails;
