import type { Metadata } from "next";
import AboutPageContent from "@/components/about/AboutPageContent";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.brand.name} - online grocery delivery in Colombo and suburbs. Everyday essentials, same-day delivery before 2:00 PM.`,
};

export const revalidate = 86400;

const AboutPage = () => {
  return <AboutPageContent />;
};

export default AboutPage;
