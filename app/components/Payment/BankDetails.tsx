import React, {useState} from 'react';

const bankDetailsData = [
  {
    bank: 'Sampath Bank',
    accName: 'GQ Mobiles Pvt Ltd',
    accNo: '004210015529',
    branch: 'Mainstreet Branch',
  },
  {
    bank: 'Commercial Bank',
    accName: 'GQ Mobile Store',
    accNo: '1720022600',
    branch: 'Pettah Branch',
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
  }
];



const BankDetails: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState(0);

  const handleBankSelect = (index: number) => {
    setSelectedBank(index);
  };

  const renderBankTabs = () => {
    return bankDetailsData.map((bank: any, index: any) => (
        <div
            key={index}
            className={`cursor-pointer py-2 rounded-lg px-4 ${
                selectedBank === index ? 'bg-blue-700 text-white' : 'bg-gray-100'
            }`}
            onClick={() => handleBankSelect(index)}
        >
          {bank.bank}
        </div>
    ));
  };

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
                    <strong className="text-gray-600">{label}:</strong> {value as string}
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
};

export default BankDetails;
