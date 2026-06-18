import type { Metadata } from "next";
import AboutPageContent from "@/components/about/AboutPageContent";
import type { GoogleReviewsFields } from "@/components/home/SectionGoogleReviews";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_GOOGLE_REVIEWS } from "@/graphql/defs/reviews";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.brand.name} — Sri Lanka's trusted pet care partner. Three brands, one commitment to happy, healthy pets.`,
};

export const revalidate = 86400;

const AboutPage = async () => {
  const googleReviews = await getClient()
    .query({ query: GET_GOOGLE_REVIEWS })
    .then(
      (res) =>
        (res.data?.googleReviews?.googleReviewsFields ??
          null) as GoogleReviewsFields | null,
    )
    .catch(() => null);

  return <AboutPageContent googleReviews={googleReviews} />;
};

export default AboutPage;
