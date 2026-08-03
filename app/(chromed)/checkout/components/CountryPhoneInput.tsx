"use client";

import React, { useState } from "react";
import Input from "shared/Input/Input";
import { countries } from "@/data/countries";

interface CountryPhoneInputProps {
  country: string;
  phone: string;
  onCountryChange: (country: string) => void;
  onPhoneChange: (phone: string) => void;
}

const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  country,
  phone,
  onCountryChange,
  onPhoneChange
}) => {
  const [showCountrySelect, setShowCountrySelect] = useState(country !== "LK");

  const handleShowSelect = () => {
    setShowCountrySelect(true);
  };

  const handleResetToLK = () => {
    onCountryChange("LK");
    setShowCountrySelect(false);
  };

  return (
    <div className="max-w-full">
      <label htmlFor="checkout-phone" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        Phone number
      </label>
      <div className="flex gap-2">
        {showCountrySelect ? (
          <select
            aria-label="Country calling code"
            className="w-28 px-2 py-2 border-2 border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            required={true}
          >
            {countries.map((countryOption) => (
              <option key={countryOption.code} value={countryOption.code}>
                {countryOption.flag} {countryOption.callingCode}
              </option>
            ))}
          </select>
        ) : (
          <div
            aria-label="Calling code: Sri Lanka, +94"
            className="flex items-center gap-1.5 px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm whitespace-nowrap"
          >
            <span aria-hidden="true" className="text-base leading-none">🇱🇰</span>
            <span className="font-medium">+94</span>
          </div>
        )}
        <Input
          id="checkout-phone"
          className="flex-1 border-2 border-slate-300 placeholder:text-slate-400 hover:border-slate-400 focus:!ring-0 focus:!border-primary-500 focus:outline-none dark:border-slate-600 dark:hover:border-slate-500"
          placeholder={"Phone (9–12 digits)"}
          value={phone}
          type="tel"
          pattern={"^[0-9]{9,12}$"}
          title={"Please enter a phone number with 9 to 12 digits"}
          onChange={(e) => onPhoneChange(e.target.value)}
          required={true}
        />
      </div>
      <div className="mt-1.5 text-xs">
        {showCountrySelect ? (
          <button
            type="button"
            onClick={handleResetToLK}
            className="text-primary-500 hover:underline font-medium"
          >
            Use Sri Lanka (+94)
          </button>
        ) : (
          <button
            type="button"
            onClick={handleShowSelect}
            className="text-slate-500 hover:text-primary-500 hover:underline"
          >
            Not in Sri Lanka?
          </button>
        )}
      </div>
    </div>
  );
};

export default CountryPhoneInput;
