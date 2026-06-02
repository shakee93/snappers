'use client'
import React, { useEffect, useId } from "react";
import Heading from "components/Heading/Heading";
import img1 from "@/public/homepage/Layer 2.png";
import img2 from "@/public/homepage/Layer 3.png";
import img3 from "@/public/homepage/Layer 5.png";
import img4 from "@/public/homepage/Layer 4.png";
import img5 from "@/public/homepage/mbp14-silver2.png";
import CardCategory3, {
  CardCategory3Props,
} from "@/components/ui/CardCategories/CardCategory3";
import Glide from "@glidejs/glide";

export const CATS_DISCOVER: CardCategory3Props[] = [
  {
    name: "Innovative Smartphones",
    desc: "Infinite Possibilities",
    featuredImage: img1,
    color: "bg-yellow-50",
  },
  {
    name: "Audio Excellence Collection",
    desc: "Immerse Yourself in Sound",
    featuredImage: img2,
    color: "bg-red-50",
  },
  {
    name: "Immersive Speaker Collection",
    desc: "Surround Yourself with Sound",
    featuredImage: img3,
    color: "bg-blue-50",
  },
  {
    name: "Futuristic Smartwatches",
    desc: "Stay Connected, Stay Active",
    featuredImage: img4,
    color: "bg-green-50",
  },
  {
    name: "Cutting-Edge Laptops",
    desc: "Elevate Your Productivity",
    featuredImage: img5,
    color: "bg-orange-50",
  }
];



const DiscoverMoreSlider = () => {
  const id = useId();
  const UNIQUE_CLASS = "glidejs" + id.replace(/:/g, "_");

  useEffect(() => {
    // @ts-ignore
    const OPTIONS: Glide.Options = {
      perView: 2.8,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          gap: 28,
          perView: 2.5,
        },
        1279: {
          gap: 20,
          perView: 2.15,
        },
        1023: {
          gap: 20,
          perView: 1.6,
        },
        768: {
          gap: 20,
          perView: 1.2,
        },
        500: {
          gap: 20,
          perView: 1,
        },
      },
    };

    let slider = new Glide(`.${UNIQUE_CLASS}`, OPTIONS);
  slider.mount();
  
  // Start autoplay
  slider.play();

  // Cleanup on component unmount
  return () => {
    slider.destroy();
  };
}, [UNIQUE_CLASS]);

  return (
    <div className={`nc-DiscoverMoreSlider nc-p-l-container ${UNIQUE_CLASS} `}>
      <Heading
        className="mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50 nc-p-r-container "
        desc=""
        rightDescText="Good things are waiting for you"
        hasNextPrev
      >
        Discover more
      </Heading>
      <div className="" data-glide-el="track">
        <ul className="glide__slides">
          {CATS_DISCOVER.map((item, index) => (
            <li key={index} className={`glide__slide`}>
              <CardCategory3
                name={item.name}
                desc={item.desc}
                featuredImage={item.featuredImage}
                color={item.color}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiscoverMoreSlider;
