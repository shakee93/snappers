import React from 'react';
import Slider from 'react-slick';
import Link from 'next/link';

interface BrandSliderProps {
  brands: { name: string; link: string }[];
}

const BrandSlider: React.FC<BrandSliderProps> = ({ brands }) => {
  if (!brands) {
    return <div>No brands available</div>;
  }

  const settings = {
    dots: false, // Remove navigation dots
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true, // Enable auto-slide
    autoplaySpeed: 3000, // Set the duration in milliseconds between slides
  };

  return (
    <Slider {...settings}>
      {brands.map((brand, index) => (
        <div key={index} className="brand-name-slide">
          <Link href={brand.link}>
            {brand.name}
          </Link>
        </div>
      ))}
    </Slider>
  );
};

export default BrandSlider;
