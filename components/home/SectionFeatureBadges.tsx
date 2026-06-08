import { PawPrint, Package, Headphones, type LucideIcon } from "lucide-react";

interface FeatureBadge {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Pill background + icon tint. */
  background: string;
  iconColor: string;
}

// Static trust badges shown under the hero. Edit copy/colors here.
const badges: FeatureBadge[] = [
  {
    id: "trusted",
    icon: PawPrint,
    title: "WELL TRUSTED",
    subtitle: "Over 900+ customers",
    background: "#FCE7D8",
    iconColor: "#E79A72",
  },
  {
    id: "fast",
    icon: Package,
    title: "SUPER FAST",
    subtitle: "With Express delivery",
    background: "#DCEFDD",
    iconColor: "#5C9B6A",
  },
  {
    id: "help",
    icon: Headphones,
    title: "EXPERT HELP",
    subtitle: "24/7 customer support",
    background: "#E9E3F4",
    iconColor: "#9183C0",
  },
];

/** Trust/feature badges row rendered beneath the hero slider. */
const SectionFeatureBadges = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`mx-auto mt-12 w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
        {badges.map(({ id, icon: Icon, title, subtitle, background, iconColor }) => (
          <div
            key={id}
            style={{ backgroundColor: background }}
            className="flex items-center gap-3 rounded-lg px-8 py-5"
          >
            <Icon className="h-6 w-6 flex-shrink-0" style={{ color: iconColor }} />
            <div className="leading-tight">
              <p className="text-base font-bold tracking-wide text-black">
                {title}
              </p>
              <p className="text-sm font-semibold text-[#00000099]">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionFeatureBadges;
