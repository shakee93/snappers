import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa6";
import NewsletterSignup from "@/components/footer/NewsletterSignup";
import { siteConfig } from "@/site.config";
import contactContent from "@/content/contact.json";

const socialLinks = [
  {
    Icon: FaInstagram,
    href: `https://www.instagram.com/${siteConfig.social.instagram}`,
    label: "Instagram",
  },
  {
    Icon: FaFacebookF,
    href: `https://www.facebook.com/${siteConfig.social.facebook}`,
    label: "Facebook",
  },
  {
    Icon: FaTiktok,
    href: `https://www.tiktok.com/${siteConfig.social.tiktok}`,
    label: "TikTok",
  },
];

const headingClass =
  "text-[14px] font-semibold uppercase tracking-wider text-white whitespace-nowrap";

const Footer = () => {
  const { footer } = siteConfig;

  return (
    <footer className="pb-20 text-white md:pb-0 mt-20">
      {/* Brand hero */}
      <div className="relative overflow-hidden bg-header-green">
        <Image
          src="/homepage/footer-overlay.png"
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="object-cover"
        />
        <div className="container relative flex justify-center items-center h-60">
          <Link href="/" aria-label={siteConfig.brand.name}>
            <Image
              src="/homepage/white-logo.png"
              alt={siteConfig.brand.name}
              width={819}
              height={119}
              className="h-12 w-auto md:h-16"
            />
          </Link>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-header-green border-y border-white/10">
        <div className="mx-auto flex max-w-[1088px] flex-col items-center justify-between gap-4 px-4 py-8 lg:flex-row">
          <p className="text-base font-semibold">{footer.newsletter.heading}</p>
          <NewsletterSignup />
        </div>
      </div>

      {/* Link columns */}
      <div className="bg-header-green">
        <div className="mx-auto grid max-w-[1088px] grid-cols-1 gap-x-8 gap-y-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-4">
            <h3 className={headingClass}>{footer.openTime.heading}</h3>
            <ul className="mt-3 space-y-2">
              {footer.openTime.schedule.map((entry) => (
                <li
                  key={entry.label}
                  className="flex flex-wrap gap-x-2 text-sm text-white/70"
                >
                  <span className="font-medium text-white/90">{entry.label}</span>
                  <span>{entry.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 sm:col-span-2 lg:col-span-4">
            <h3 className={headingClass}>{footer.visitUsHeading}</h3>
            <ul className="mt-3 space-y-3">
              {contactContent.locations.map((location) => (
                <li key={location.name} className="text-sm leading-snug text-white/70">
                  <p className="font-medium text-white/90">{location.name}</p>
                  <p className="mt-0.5">
                    {location.addressLine1} {location.addressLine2}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3">
                    {location.phones.map((phone) => (
                      <Link
                        key={phone.tel}
                        href={`tel:${phone.tel}`}
                        className="hover:text-white"
                      >
                        {phone.display}
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-2">
            <h3 className={headingClass}>{footer.shopHeading}</h3>
            <ul className="mt-3 space-y-1.5">
              {siteConfig.navigation.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-2">
            <h3 className={headingClass}>{footer.customerServices.heading}</h3>
            <ul className="mt-3 space-y-1.5">
              {footer.customerServices.links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#293417]">
        <div className="mx-auto max-w-[1088px] py-8 px-4">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-white">
                Payment Methods
              </p>
              <Image
                src="/global/payments.png"
                alt="Accepted payment methods"
                width={243}
                height={23}
                className="mt-3 h-8 w-auto"
              />
            </div>
            <div className="md:text-right">
              <p className="text-sm font-semibold uppercase text-white">
                {footer.support.heading}
              </p>
              <div className="mt-1 flex flex-col items-start gap-1 md:items-end">
                {footer.support.phones.map((phone) => (
                  <Link
                    key={phone.tel}
                    href={`tel:${phone.tel}`}
                    className="flex items-center gap-2 text-2xl font-bold"
                  >
                    <Phone size={20} className="text-[#a3c83f]" />
                    {phone.display}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse items-center justify-between gap-4 pt-6 md:flex-row">
            <div className="flex items-center gap-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/40 hover:text-white"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} {siteConfig.brand.name}.lk All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
