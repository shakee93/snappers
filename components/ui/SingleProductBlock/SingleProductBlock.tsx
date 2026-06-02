import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import ProductImage1 from "@/public/iphone.webp";
import ProductImage2 from "@/public/iphone15_variation1.webp";
import ProductImage3 from "@/public/iphone15_variation2.webp";
import ProductImage4 from "@/public/iphone.webp";

const SingleProductBlock = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentVariation, setCurrentVariation] = useState(0);

  const productVariations = [ProductImage1, ProductImage2, ProductImage3, ProductImage4];
  const delayBeforeNextImage = 1500;

  let hoverIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current !== null) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, []);

  const handleHover = () => {
    setIsHovered(true);
    startSlider();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    setCurrentVariation(0);
    clearInterval(hoverIntervalRef.current!);
  };

  const handleDotClick = (index: any) => {
    setCurrentVariation(index);
    clearInterval(hoverIntervalRef.current!);
  };

  const startSlider = () => {
    hoverIntervalRef.current = window.setInterval(() => {
      setCurrentVariation((prev) => (prev + 1) % productVariations.length);
    }, delayBeforeNextImage);
  };

  const sliderStyle = {
    display: 'flex',
    cursor: 'pointer',
    transition: 'transform 0.3s ease-in-out',
    transform: `translateX(-${currentVariation * 100}%)`,
  };

  return (
    <>
      <div
        className="bg-white w-full p-2 rounded-2xl my-2"
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverOut}
      >
        <div className="rounded-2xl border-1 relative overflow-hidden">
          <div style={sliderStyle}>
            {productVariations.map((image, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0"
              >
               <Image fill style={{ objectFit: 'cover' }}
                  src={image}
                  alt="Product"
                  className="object-contain w-full h-72"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center mt-2">
            {productVariations.map((_, index) => (
              <div
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 mx-1 rounded-full cursor-pointer ${index === currentVariation ? "bg-gray-800" : "bg-gray-300"
                  }`}
              ></div>
            ))}
          </div>
          <div className="relative bottom-7 -mb-6 p-1.5 text-center text-xs text-red-950 bg-red-300">
            Only 3 left in stock
          </div>
        </div>
        <div className="py-2">
          <div className="px-3 text-sm font-medium line-clamp-2">
            iPhone 14 Pro 512GB red green white Silver 5G With FaceTime - Middle East Version
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleProductBlock;