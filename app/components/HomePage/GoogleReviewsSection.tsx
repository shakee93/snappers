import { Button } from "@nextui-org/react";
import Heading from "../Heading/Heading";

const GoogleReviewsSection = () => {
  const googleReviewUrl = "https://www.google.com/search?hl=en-LK&gl=lk&q=ground+floor,+GQ+-The+Mobile+Store,+250,+54+R.+A.+De+Mel+Mawatha,+Colombo+00300&ludocid=1458190955880003094&lsig=AB86z5VvNAV33q2slj2rSzJqGGyh#lrd=0x3ae25975d215fa97:0x143c88f2d3ea3616,3";

  return (
    <div className="w-full py-8 flex justify-center items-center bg-transparent">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl px-4">
        <span className="font-bold text-xl md:text-2xl text-center mb-4 md:mb-0">Share Your Experience</span>
        <Button
          as="a"
          href={googleReviewUrl}
          target=""
          rel="noopener noreferrer"
          className="bg-blue-800 text-white text-base px-8 py-2 rounded-full shadow-md transition-all duration-200 font-medium w-fit md:w-auto"
        >
          Write a Review on Google
        </Button>
      </div>
    </div>
  );
};

export default GoogleReviewsSection;