import React from 'react';

interface BankDetails {
  bank: string;
  accName: string;
  accNo: string;
  sortCode: string;
  iban: string;
  bic: string;
}

const bankDetails: BankDetails = {
  bank: 'Commercial',
  accName: "THARIQ BHAII",
  accNo: '34312421543545',
  sortCode: 'fsefsa',
  iban: 'asdfadsfasd',
  bic: 'fsadfsdfasdf',
};

const BankDetails: React.FC = () => {
  const bankDetailsArray: [string, string][] = Object.entries(bankDetails);

  return (
    <div className="">
      <p className="text-2xl font-bold text-left">Our Bank Details</p>
      <div className="">
        <h1 className="text-xl sm:py-8 py-2 text-left ">GQ Mobile</h1>
        <ul className="list-disc pl-4">
          {bankDetailsArray.map(([label, value]) => (
            <li key={label} className="mb-2 text-left">
              <strong className="text-gray-600">{label}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BankDetails;
