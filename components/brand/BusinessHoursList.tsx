import { Clock } from "lucide-react";
import { siteConfig } from "@/site.config";

type BusinessHoursListProps = {
  iconSize?: number;
  className?: string;
  labelClassName?: string;
  hoursClassName?: string;
};

export default function BusinessHoursList({
  iconSize = 18,
  className = "flex flex-col gap-1 md:gap-2 text-xs md:text-sm leading-tight md:leading-snug",
  labelClassName = "font-medium text-gray-800",
  hoursClassName = "block font-normal text-gray-500",
}: BusinessHoursListProps) {
  const { schedule } = siteConfig.businessHours;

  return (
    <div className="flex gap-3">
      <div className="shrink-0">
        <Clock size={iconSize} className="text-primary-500" aria-hidden />
      </div>
      <div className={className}>
        {schedule.map((entry) => (
          <div key={entry.label} className={labelClassName}>
            {entry.label}
            <span className={hoursClassName}>{entry.hours}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
