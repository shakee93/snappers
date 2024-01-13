import React, {useState} from 'react';

const bankDetailsData = [
  {
    bank: 'Commercial',
    accName: 'THARIQ BHAII',
    accNo: '34312421543545',
    sortCode: 'fsefsa',
    iban: 'asdfadsfasd',
    bic: 'fsadfsdfasdf',
  },
  {
    bank: 'Bank 2',
    accName: 'Account Name 2',
    accNo: 'Account Number 2',
    sortCode: 'Sort Code 2',
    iban: 'IBAN 2',
    bic: 'BIC 2',
  },
  {
    bank: 'Bank 3',
    accName: 'Account Name 3',
    accNo: 'Account Number 3',
    sortCode: 'Sort Code 3',
    iban: 'IBAN 3',
    bic: 'BIC 3',
  },
];

const BankDetails: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState(0);

  const handleBankSelect = (index: number) => {
    setSelectedBank(index);
  };

  const renderBankTabs = () => {
    return bankDetailsData.map((bank, index) => (
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
