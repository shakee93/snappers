'use client'
import Link from "next/link";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import CategoryDropdown from "./CategryDropdown";
import {useEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {usePathname} from "next/navigation";
import {twMerge} from "tailwind-merge";


interface BrandBarProps {
  brands: Brand[]
  categories: ProductCategory[]
}

const BrandBar = ({ brands, categories}: BrandBarProps) => {

  const ref = useRef<HTMLDivElement>(null)
  const [scrolled, setScrollPosition] = useState(0)
  const path = usePathname()

  // Function to handle the scroll event
  const handleScroll = () => {
    if (ref.current) {
      setScrollPosition(ref.current.scrollLeft);
    }
  };

  // Add a scroll event listener when the component mounts
  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('scroll', handleScroll);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const smoothScroll = (reverse = false) => {

    if (!ref.current) {
      return;
    }


    const scroll = 0.05 * ref.current.scrollWidth;
    ref.current.scrollBy({
      left: reverse ? scroll * -1 : scroll,
      behavior: "smooth"
    });
  }

  return (
    <div className="flex border-t z-50 max-w-[calc(100vw-157px)]">
      <div className="relative w-full flex justify-between items-center">
        <div  className='items-center text-primaryColor font-semibold flex h-full'>
          <CategoryDropdown categories={categories}/>
        </div>
        {(scrolled > 0) &&
            <button onClick={e => smoothScroll(true)}
                    className='absolute z-10 left-[181px] py-3.5 border-l px-3.5 pr-8 bg-gradient-to-r from-white via-white to-transparent'>
              <ChevronLeft/>
            </button>
        }
        <div ref={ref} className="relative w-full flex justify-between overflow-x-scroll hidden-scrollbar pr-10">
          {brands?.map((brand: Brand, index: number) => (
            <Link
              key={index}
              href={`/${brand.slug}`}
              className={twMerge(
                  "flex-1 hover:text-white hover:bg-primaryColor px-4 whitespace-nowrap py-4 uppercase text-center font-medium text-gray-700 tracking-wide text-sm border-l",
                  path === `/${brand.slug}` && 'bg-primaryColor text-white'
              )}
            >
              {brand.name}
            </Link>
          ))}

        </div>
        <button onClick={e => smoothScroll()}
                className='absolute z-10 right-0 py-3.5 px-3.5 pl-8 bg-gradient-to-l from-white via-white to-transparent'>
          <ChevronRight/>
        </button>
      </div>
    </div>
  );
};

export default BrandBar;
