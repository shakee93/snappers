import { Button } from "@nextui-org/react";
import { siteConfig } from "@/site.config";

const GoogleReviewsSection = () => {
  const googleReviewUrl = siteConfig.social.googleReviewUrl;

  return (
    <div className="w-full py-2 md:py-8 flex justify-center items-center bg-transparent">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl">
        <span className="font-bold text-xl md:text-2xl text-center">Share Your Experience</span>
        <Button
          as="a"
          href={googleReviewUrl}
          target=""
          rel="noopener noreferrer"
          className="bg-blue-800  text-white text-base  px-8 py-2 rounded-full shadow-md transition-all duration-200  font-medium"
        >
          Write a Review on Google
        </Button>
      </div>
    </div>
  );
};

export default GoogleReviewsSection; 