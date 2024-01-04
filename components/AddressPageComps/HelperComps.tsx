
import Input from "@/shared/Input/Input";
import Select from "@/shared/Select/Select";
import Label from "../Label/Label";
import React from "react";


const SRI_LANKAN_STATES = [
    "Western",
    "Central",
    "Southern",
    "Northern",
    "Eastern",
    "North Western",
    "North Central",
    "Uva",
    "Sabaragamuwa",
  ];
// Smaller Components
const InputField = React.memo(function InputField({ label, name, placeholder, value, onChange }: any) {
    return (
        <div className="flex-1">
            <Label>{label}</Label>
            <Input
                required={true}
                className="w-full"
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
});

const SelectField = React.memo(function SelectField({ label, name, value, options, onChange, disabled = false }: any) {
    return (
        <div className="flex-1">
            <Label>{label}</Label>
            <Select required={true} className="mt-1.5" value={value || ''} name={name} onChange={onChange} disabled={disabled}>
                {options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Select>
        </div>
    );
});

export { InputField, SelectField, SRI_LANKAN_STATES };
