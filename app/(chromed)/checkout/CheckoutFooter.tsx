import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { siteConfig } from "@/site.config";

const policyLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/warranty-terms", label: "Warranty" },
  { href: "/contact", label: "Contact" },
];

const CheckoutFooter = () => {
  return (
    <footer className="border-t bg-white">
      <div className="container py-6 flex flex-col items-center gap-3 text-xs text-gray-500">
        <div className="inline-flex items-center gap-1.5 text-gray-600">
          <ShieldCheck size={14} className="text-green-600" />
          <span>All transactions are encrypted and secure</span>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {policyLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-primaryColor">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div>© {new Date().getFullYear()} {siteConfig.brand.legalName}.</div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;
