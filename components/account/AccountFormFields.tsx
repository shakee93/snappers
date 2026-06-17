import React, { ChangeEvent, memo } from "react";
import Label from "@/components/global/primitives/Label/Label";
import AccountInput from "@/components/account/AccountInput";
import AccountSelect from "@/components/account/AccountSelect";
import {
  accountCompactInputClassName,
  accountCompactLabelClassName,
  accountLabelClassName,
} from "@/components/account/accountStyles";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  compact?: boolean;
};
type InputFieldProps = FieldProps & {
  placeholder?: string;
};

type SelectOption = { value: string; label: string };

type SelectFieldProps = FieldProps & {
  options: SelectOption[];
  disabled?: boolean;
};

export const AccountInputField = memo(function AccountInputField({
  label,
  name,
  placeholder,
  value,
  onChange,
  compact = false,
}: InputFieldProps) {
  return (
    <div className="flex-1">
      <Label className={cn(accountLabelClassName, compact && accountCompactLabelClassName)}>
        {label}
      </Label>
      <AccountInput
        required
        className={cn("w-full", compact && accountCompactInputClassName)}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
});
export const AccountSelectField = memo(function AccountSelectField({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
  compact = false,
}: SelectFieldProps) {
  return (
    <div className="flex-1">
      <Label className={cn(accountLabelClassName, compact && accountCompactLabelClassName)}>
        {label}
      </Label>
      <AccountSelect
        required
        className={cn(compact && accountCompactInputClassName)}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
      >        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AccountSelect>
    </div>
  );
});
