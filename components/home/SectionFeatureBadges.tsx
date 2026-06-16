import Image from "next/image";

interface FeatureBadge {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  subtitle: string;
  background: string;
}

// Static trust badges shown under the hero. Edit copy/colors here.
const badges: FeatureBadge[] = [
  {
    id: "trusted",
    iconSrc: "/icons/paw-feat.png",
    iconAlt: "Well trusted",
    title: "WELL TRUSTED",
    subtitle: "Over 900+ customers",
    background: "#FDE6D6",
  },
  {
    id: "fast",
    iconSrc: "/icons/box-feat.png",
    iconAlt: "Super fast delivery",
    title: "SUPER FAST",
    subtitle: "With Express delivery",
    background: "#EBF3EF",
  },
  {
    id: "help",
    iconSrc: "/icons/support-feat.png",
    iconAlt: "Expert help",
    title: "EXPERT HELP",
    subtitle: "24/7 customer support",
    background: "#EAE8F3",
  },
];

/** Trust/feature badges row rendered beneath the hero slider. */
const SectionFeatureBadges = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`mx-auto mt-12 w-full max-w-[300px] md:max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
        {badges.map(({ id, iconSrc, iconAlt, title, subtitle, background }) => (
          <div
            key={id}
            style={{ backgroundColor: background }}
            className="flex items-center gap-3 rounded-xl px-8 py-5"
          >
            <Image
              src={iconSrc}
              alt={iconAlt}
              width={32}
              height={32}
              className="h-10 w-10 shrink-0 object-contain"
            />
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
