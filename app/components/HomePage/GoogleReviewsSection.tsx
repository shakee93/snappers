import { Button } from "@nextui-org/react";
import Heading from "../Heading/Heading";

const GoogleReviewsSection = () => {
  const googleReviewUrl = "https://www.google.com/search?hl=en-LK&gl=lk&q=ground+floor,+GQ+-The+Mobile+Store,+2[…]ludocid=1458190955880003094&lsig=AB86z5VvNAV33q2slj2rSzJqGGyh";

  return (
    <div className="w-full py-8 flex justify-center items-center bg-transparent">
      <div className="flex flex-row items-center justify-center gap-4 w-full max-w-2xl">
        <span className="font-bold text-xl md:text-2xl text-center">Share Your Experience</span>
        <Button
          as="a"
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-800 hover:bg-blue-900 text-white text-base  px-8 py-2 rounded-full shadow-md transition-all duration-200  font-medium"
        >
          Write a Review on Google
        </Button>
      </div>
    </div>
  );
};

export default GoogleReviewsSection; 