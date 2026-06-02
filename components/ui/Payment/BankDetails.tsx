import React, {useState} from 'react';

type BankDetail = {
  bank: string;
  accName: string;
  accNo: string;
  branch: string;
};

const bankDetailsData: BankDetail[] = [
  {
    bank: 'Sampath Bank',
    accName: 'GQ Mobiles Pvt Ltd',
    accNo: '004210015529',
    branch: 'Mainstreet Branch',
  },
  {
    bank: 'Commercial Bank',
    accName: 'GQ Mobiles Pvt Ltd',
    accNo: '1000475584',
    branch: 'Head office',
  },
  {
    bank: 'People’s Bank',
    accName: 'GQ MOBILES (PVT) LTD',
    accNo: '309100120010779',
    branch: 'Liberty Plaza',
  },
  {
    bank: 'HNB',
    accName: 'GQ Mobile Store',
    accNo: '007010313159',
    branch: 'Mainstreet Branch',
  },
  {
    bank: 'NTB',
    accName: 'GQ Mobile Store',
    accNo: '100030010564',
    branch: 'Bankshall Street Branch',
  },
];

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
              {Object.entries(selectedBankDetails).map(([label, value]) => (
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
