import { BadgeMinus, Check } from "lucide-react";

export const RequiredTag = () => {
  return (
    <div className={`py-2 px-4  flex  gap-2  rounded-xl bg-red-100 `}>
      <BadgeMinus color="red" />
      <div className={`text-red-500 font-semibold`}>Required</div>
    </div>
  );
};
export const CompletedTag = () => {
  return (
    <div className={`py-2 px-4  flex  gap-2  rounded-xl bg-green-100 `}>
      <Check color="green" />
      <div className={`text-green-500 font-semibold`}>Completed</div>
    </div>
  );
};


