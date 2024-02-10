import ImageMagnifier from "@/components/ImageMagnifier";
import ImageEffect from "@/components/ImageMagnifier";
import React from "react";

const QuickPage: React.FC = () => {
  return (
    <main className="min-h-screen flex flex-col text-center justify-center items-center">
      <h1 className='text-5xl mb-10 font-bold'>IMAGE MAGNIFIER</h1>
      <ImageEffect src={``} />
    </main>
  );
};

export default QuickPage;
