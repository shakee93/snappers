import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/gq-logo.png";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRANDS } from "@/graphql/defs/products";
import { Brand } from "@/graphql/types/graphql";
import { Clock, Copyright, Facebook, Heart, Instagram, Mail, MapPinned } from "lucide-react";
import { PiFacebookLogoDuotone, PiInstagramLogoDuotone, PiTiktokLogo, PiTiktokLogoDuotone } from "react-icons/pi";
import { isPaymentPage } from "./paymentPageCheckUtilsServer";
import { Divider } from "@nextui-org/react";
import { HeartFilledIcon } from "@radix-ui/react-icons";

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

        <div className="py-8 flex flex-row gap-6 justify-center">
          <Link className="flex gap-2"
            href={"https://www.facebook.com/gqmobilestore"}
          >
            <PiFacebookLogoDuotone size={32} strokeWidth={1.25} className="text-primaryColor" />
          </Link>
          <Link
            className="flex gap-2"
            href={"https://www.instagram.com/gqthemobilestore/"}
          >
            <PiInstagramLogoDuotone size={32} strokeWidth={1.25} className="text-primaryColor" />
          </Link>
          <Link
            className="flex gap-2"
            href="https://www.tiktok.com/@gqmobiles"
          >
            <PiTiktokLogoDuotone size={32} strokeWidth={1.25} className="text-primaryColor" />
          </Link>

        </div>

        <div className="pb-8 grid grid-cols-12 gap-x-1 gap-y-3 md:grid-cols-12 xl:grid-cols-12 justify-between">

          {/* <div className=" xl:flex gap-1 col-span-12 md:col-span-4 lg:col-span-3 md:gap-3 p-2 flex-col items-center md:items-start justify-center">
            <Link href={"/"} className="flex justify-center">
              <Image
                width={100}
                src={SiteLogo}
                alt="logo"
                className="h-28 md:h-20  lg:h-24 pb-5   w-auto rounded-b-2xl"
              />
            </Link>

            <ul className="flex text-xs flex-col gap-3 pb-4">
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <MapPinned size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>GQ — The Mobile Store</div>
                  <div>
                    No. 250 | 53 - 54 Ground Floor, Liberty Plaza, Colombo 03.
                  </div>
                  <div className="flex flex-col mt-2">
                    <Link href={"tel:0777555665"}>0777 555 665</Link>
                    <Link href={"tel:0112372665"}>0112 372 665</Link>
                  </div>
                </div>
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <MapPinned size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>GQ — The Authentic Store</div>
                  <div>
                    No. 250 | 1 | 161 First Floor, Liberty Plaza, Colombo 03.
                  </div>
                  <div className="flex flex-col mt-2">
                    <Link href={"tel:0777988665"}>0777 988 665</Link>
                    <Link href={"tel:0754555665"}>0754 555 665</Link>
                    <Link href={"tel:0112447489"}>0112 447 489</Link>
                  </div>
                </div>
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <Clock size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>Business Hours:</div>
                  <div>Mon - Sat (10.00AM - 08.00PM)</div>
                  <div>Sundays & Poya's (10.00AM - 05.00PM)</div>
                </div>
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <Mail size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>
                    <Link href={"mailto:Inquires@gqmobiles.lk"}>
                      Inquires@gqmobiles.lk
                    </Link>
                  </div>
                </div>
              </li>
            </ul>
          </div> */}

          <div className="flex gap-1 col-span-6 md:gap-4 md:col-span-3 p-2 flex-col items-start md:items-center">
            <div className="grid gap-2 md:gap-4">
              <div className="text-base md:text-lg text-left font-medium text-primaryColor">
                Quick Links
              </div>
              <ul className="text-xs text-left lg:text-sm text-gray-500 flex flex-col gap-3 ">
                {/* <li className="hover:text-primaryColor">
                  <Link href={"/"}>Home</Link>
                </li> */}
                <li className="hover:text-primaryColor">
                  <Link href={"/collections/all"}>Shop</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/about"}>About us</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/contact"}>Contact Us</Link>
                </li>
                {/* <li className="hover:text-primaryColor">
                  <Link href={"/search"}>Search Products</Link>
                </li> */}
                <li className="hover:text-primaryColor">
                  <Link href={"/privacy"}>Privacy Policy</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/warranty-terms"}>Warranty Terms</Link>
                </li>
                <li className="hover:text-primaryColor">
                  <Link href={"/terms-and-conditions"}>Terms & Conditions</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-1 col-span-6 md:gap-4 md:col-span-3 pt-2 px-2 flex-col items-start md:items-center">
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
              <ul className="hidden md:grid text-xs text-left lg:text-sm text-gray-500 grid grid-cols-2 md:grid-cols-2 gap-x-4 md:gap-x-3 gap-y-3">
                {brands.slice(0, 12).map((brand: Brand, index: number) => (
                  <li key={index} className="hover:text-primaryColor">
                    <Link href={`/${brand.slug}`}>{brand.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="xl:flex gap-1 col-span-6 md:col-span-3 md:gap-3 p-2 flex-col items-center md:items-start">
            <div className="text-base  md:text-lg font-medium text-primaryColor">
              Address
            </div>
            <ul className="flex text-xs flex-col gap-3 pb-4">
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <MapPinned size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>GQ Mobiles</div>
                  <div>
                    No. 250 | 53 - 54 Ground Floor, Liberty Plaza, Colombo 03.
                  </div>
                  <div className="flex flex-col mt-2 text-primaryColor">
                    <Link href={"tel:0777988665"}>0777 988 665</Link>
                    <Link href={"tel:0727988665"}>0727 988 665</Link>
                    <Link href={"tel:0112372665"}>0112 372 665</Link>
                  </div>
                </div>
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <MapPinned size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>GQ Authentics</div>
                  <div>
                    No. 250 | 1/61 First Floor, Liberty Plaza, Colombo 03.
                  </div>
                  <div className="flex flex-col mt-2 text-primaryColor">
                    <Link href={"tel:0777555665"}>0777 555 665</Link>
                    <Link href={"tel:0754555665"}>0754 555 665</Link>
                    <Link href={"tel:0112447489"}>0112 447 489</Link>
                  </div>
                </div>
              </li>
              {/* <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <Clock size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>Business Hours:</div>
                  <div>Mon - Sat (10.00AM - 08.00PM)</div>
                  <div>Sundays & Poya's (10.00AM - 05.00PM)</div>
                </div>
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <Mail size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>
                    <Link href={"mailto:Inquires@gqmobiles.lk"}>
                      Inquires@gqmobiles.lk
                    </Link>
                  </div>
                </div>
              </li> */}
            </ul>
          </div>

          <div className="xl:flex gap-1 col-span-6 md:col-span-3 md:gap-3 p-2 flex-col items-center md:items-start">
            <div className="text-base  md:text-lg font-medium text-primaryColor">
              Business Hours
            </div>
            <ul className="flex text-xs flex-col gap-3 pb-4">
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <Clock size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col gap-1 md:gap-2 text-xs md:text-sm leading-tight md:leading-snug">
                  <div className="font-medium text-gray-800 ">Monday - Saturday&nbsp;
                    <span className="block font-normal text-gray-500">10.00AM&nbsp;-&nbsp;08.00PM</span>
                  </div>
                  <div className="font-medium text-gray-800 ">Sunday &amp; Poya&apos;s&nbsp;
                    <span className="block font-normal text-gray-500">10.00AM&nbsp;-&nbsp;05.00PM</span>
                  </div>
                </div>
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <Mail size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>
                    <Link href={"mailto:Inquires@gqmobiles.lk"}>
                      Inquires@gqmobiles.lk
                    </Link>
                  </div>
                </div>
              </li>

              <Link href={"/"} className="flex justify-center pr-16 mt-3">
                <Image
                  width={100}
                  src={SiteLogo}
                  alt="logo"
                  className="h-28 md:h-20 lg:h-32 w-auto rounded-b-2xl"
                />
              </Link>
            </ul>
          </div>

          {/* <div className=" flex gap-3 md:gap-4 md:hidden lg:flex md:col-span-2 col-span-12 p-2 flex-col items-start md:items-center">
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

          </div> */}

        </div>

      </div>

      <div className="text-center text-xs text-white py-4 bg-primaryColor">
        <div className="container flex gap-4 justify-center flex-wrap">
          <div className="flex gap-2 items-center"><Copyright size={16} /> {new Date().getFullYear()} GQ Mobiles (Pvt) Ltd.</div>
          <div>{" | "} </div>
          <div className="flex gap-2 items-center">
            Handcrafted with <HeartFilledIcon className="text-red-500" /> by {" "}
            <Link
              target="_blank"
              className="underline"
              href={`https://freshpixl.com/`}
            >
              Freshpixl Creative Agency
            </Link>{" "}
          </div>
        </div>
      </div>

    </footer >
  );
};

export default Footer;
