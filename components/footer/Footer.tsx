import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import { siteConfig } from "@/site.config";

const footerSocialLinks = [
  { label: "Facebook", href: siteConfig.social.facebook, Icon: FaFacebookF },
  { label: "Instagram", href: siteConfig.social.instagram, Icon: FaInstagram },
  { label: "X", href: siteConfig.social.x, Icon: FaXTwitter },
  { label: "TikTok", href: siteConfig.social.tiktok, Icon: FaTiktok },
] as const;

const headingClass =
  "inline-block border-b border-[#FACC15] pb-1 text-[13px] font-semibold uppercase tracking-wider text-[#FACC15]";

const Footer = () => {
  const { footer } = siteConfig;
  const quickLinks = siteConfig.navigation.footerQuickLinks;

  return (
    <footer className="mt-16 pb-20 text-white md:pb-0 lg:mt-20">
      <div className="bg-header-green">
        {/* Link columns */}
        <div className="mx-auto grid max-w-[1368px] grid-cols-1 gap-x-8 gap-y-6 px-4 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:px-6 xl:px-0">
          <div className="min-w-0">
            <h3 className={headingClass}>{quickLinks.heading}</h3>
            <ul className="mt-3 space-y-1.5">
              {quickLinks.links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className={headingClass}>{footer.shopHeading}</h3>
            <ul className="mt-3 space-y-1.5">
              {siteConfig.navigation.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className={headingClass}>{footer.customerServices.heading}</h3>
            <ul className="mt-3 space-y-1.5">
              {footer.customerServices.links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className={headingClass}>{footer.openTime.heading}</h3>
            <ul className="mt-3 space-y-4">
              {footer.openTime.groups.map((group, groupIndex) => {
                const groupName =
                  "name" in group && typeof group.name === "string"
                    ? group.name
                    : undefined;
                return (
                <li key={groupName ?? groupIndex}>
                  {groupName ? (
                    <p className="text-sm font-medium text-white/90">{groupName}</p>
                  ) : null}
                  <ul className={groupName ? "mt-1.5 space-y-3" : "space-y-3"}>
                    {group.lines.map((line) => (
                      <li
                        key={line.label}
                        className="text-sm leading-snug text-white/70"
                      >
                        <p className="font-medium text-white/90">{line.label}</p>
                        <p className="mt-0.5">{line.hours}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              );
              })}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className={headingClass}>{footer.socialHeading}</h3>
            <ul className="mt-3 space-y-1.5">
              {footerSocialLinks.map(({ label, href, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <Icon
                      size={15}
                      className="shrink-0 text-[#FACC15]"
                      aria-hidden
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black">
        <div className="mx-auto max-w-[1368px] px-4 py-3 lg:px-6 xl:px-0">
          <p className="text-center text-sm text-white/60">
            © {new Date().getFullYear()} {siteConfig.brand.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
