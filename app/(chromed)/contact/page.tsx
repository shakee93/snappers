import type { Metadata } from "next";
import ContactPageContent from "@/components/contact/ContactPageContent";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${siteConfig.brand.name} - grocery delivery in Colombo and suburbs. Phone, email, or send a message.`,
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
