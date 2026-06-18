import type { Metadata } from "next";
import ContactPageContent from "@/components/contact/ContactPageContent";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.brand.name}. Visit our stores or send us a message.`,
};

export const revalidate = 86400;

const ContactPage = () => {
  return (
    <ContactPageContent
      formspreeId={siteConfig.contact.formspreeContactFormId}
    />
  );
};

export default ContactPage;
