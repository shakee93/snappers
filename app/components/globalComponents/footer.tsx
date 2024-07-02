import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";
import SiteLogoNew from "@/public/global/LogoNew.webp";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRANDS } from "@/graphql/defs/products";
import { Brand } from "@/graphql/types/graphql";
import { Facebook, Instagram, MapPinned, PhoneCall } from "lucide-react";
import { isPaymentPage } from "./paymentPageCheckUtils";
import { Divider } from "@nextui-org/react";

const getData = async () => {
  const { data } = await getClient().query({
    query: GET_BRANDS,
  });

  return data.brands?.nodes;
};

const Footer = async () => {
  const brands = await getData();
  const iconSize = 18;

  if (isPaymentPage()) {
    return <></>;
  }

  return (
    <footer className="border-t pb-20 md:pb-0 text-black">
      <div className="container">
        <div className=" py-16  grid grid-cols-12 gap-x-1 gap-y-3 md:grid-cols-12 xl:grid-cols-12 justify-between">
          <div className=" xl:flex gap-1 col-span-12 md:col-span-4 lg:col-span-3 md:gap-3 p-2 flex-col items-center md:items-start justify-center">
            <Link href={"/"} className="flex justify-center">
              <Image
                width={100}
                src={SiteLogoNew}
                alt="logo"
                className="h-28 md:h-20  lg:h-24 pb-5   w-auto rounded-b-2xl"
              />
            </Link>
            {/* <div className="text-base md:text-lg font-medium text-primaryColor">
              Our Branches
            </div> */}
            {/* <div className="text-base md:text-base font-medium text-black">
              Flagship Store
            </div> */}
            <ul className="flex text-xs flex-col gap-3 pb-4">
              <li className=" lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <MapPinned size={iconSize} className="text-primaryColor" />
                </div>
                <div>250/54, Ground Floor, Liberty Plaza, Colombo 03.</div>
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <PhoneCall size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>
                    <Link href={"tel:0777555665"}> 0777 555 665</Link> /{" "}
                    <Link href={"tel:0777988665"}> 0777 988 665</Link>{" "}
                  </div>
                  <div>
                    <Link href={"tel:0112372665"}> / 0112 372 665</Link>
                  </div>
                </div>
              </li>
            </ul>
            {/* <div className="text-base md:text-base font-medium text-black">
              Branch
            </div> */}
            {/*<ul className="flex  text-xs pt-5 md:pt-3 flex-col gap-3 ">*/}
            {/*  <li className="lg:text-sm text-gray-500 flex gap-3">*/}
            {/*    <div>*/}
            {/*      <MapPinned size={iconSize} className="text-primaryColor" />*/}
            {/*    </div>*/}
            {/*    <div>157, 2nd Cross Street, Colombo 11.</div>{" "}*/}
            {/*  </li>*/}
            {/*  <li className="lg:text-sm text-gray-500 flex gap-3">*/}
            {/*    <div>*/}
            {/*      <PhoneCall size={iconSize} className="text-primaryColor" />*/}
            {/*    </div>*/}
            {/*    <div>*/}
            {/*      <Link href={"tel:0777500511"}>077 750 0511</Link>*/}
            {/*    </div>*/}
            {/*  </li>*/}
            {/*</ul>*/}
          </div>
          <div className="flex gap-1 md:gap-4 col-span-6 md:col-span-4 lg:col-span-3 p-2 flex-col items-start md:items-center">
            <div className="grid gap-2 md:gap-4">
              <div className="text-base md:text-lg text-left font-medium text-primaryColor">
                Quick Links
              </div>
              <ul className="text-xs text-left lg:text-sm text-gray-500 flex flex-col gap-3 ">
                <li className="hover:text-primaryColor">
                  <Link href={"/"}>Home</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/about"}>About us</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/collections/all"}>Shop</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/contact"}>Contact Us</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/search"}>Search Products</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/privacy"}>Privacy Policy</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/terms-and-conditions"}>Terms & Conditions</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex gap-1 md:gap-4 col-span-6 md:col-span-4 pt-2 px-2 flex-col items-start md:items-center">
            <div className="grid gap-2 md:gap-4">
              <div className="text-base  md:text-lg font-medium text-primaryColor">
                Top Brands
              </div>
              <ul className="text-xs md:hidden text-left lg:text-sm text-gray-500 grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-3 gap-y-3">
                {brands.slice(0, 12).map((brand: Brand, index: number) => (
                  <li key={index} className="hover:text-primaryColor">
                    <Link href={`/${brand.slug}`}>{brand.name}</Link>
                  </li>
                ))}
              </ul>
              <ul className="hidden md:grid text-xs text-left lg:text-sm text-gray-500 grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-3 gap-y-3">
                {brands.slice(0, 20).map((brand: Brand, index: number) => (
                  <li key={index} className="hover:text-primaryColor">
                    <Link href={`/${brand.slug}`}>{brand.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className=" flex gap-3 md:gap-4 md:hidden lg:flex md:col-span-2 col-span-12 p-2 flex-col items-start md:items-center">
            <div className="grid gap-2 md:gap-4">
              <div className="text-base md:text-lg font-medium text-primaryColor">
                Follow us
              </div>

              <div className="flex md:flex-col gap-3 justify-center text-xs text-gray-500">
                <Link
                  className="flex gap-2"
                  href={"https://www.facebook.com/gqmobilestore"}
                >
                  <Facebook size={iconSize} className="text-primaryColor" />
                  <span>Facebook</span>
                </Link>
                <Link
                  className="flex gap-2"
                  href={"https://www.instagram.com/gqthemobilestoreunlimited"}
                >
                  <Instagram size={iconSize} className="text-primaryColor" />
                  <span>Instagram</span>
                </Link>
              </div>
            </div>
            {/* <div className="relative w-full flex">
              <input
                  className="block p-2 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:rounded-none sm:rounded-l-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Enter your email"
                  type="email"
                  id="email"
                  required
              />
              <div>
                <button
                    type="submit"
                    className="py-3 px-5 w-full text-xs md:text-sm font-medium text-center text-white rounded-lg border cursor-pointer bg-primary-700 border-primary-600 sm:rounded-none sm:rounded-r-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Subscribe
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-white py-2 bg-primaryColor">
        <div className="container flex gap-4 justify-center flex-wrap">
          <div>Copyright ©️ 2024 GQ Mobiles (Pvt) Ltd.</div>
          <div>{" | "} </div>
          <div>
            Designed by{" "}
            <Link target="_blank" className="font-semibold" href={`https://freshpixl.com/`}>
              Freshpixl Creative Agency
            </Link>{" "}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
