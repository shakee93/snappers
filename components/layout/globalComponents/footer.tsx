import { Suspense } from "react";
import Link from "next/link";
import SiteLogoImage from "@/components/brand/SiteLogoImage";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRANDS } from "@/graphql/defs/products";
import { Brand } from "@/graphql/types/graphql";
import { Copyright, Mail, MapPinned } from "lucide-react";
import BusinessHoursList from "@/components/brand/BusinessHoursList";
import { PiFacebookLogoDuotone, PiInstagramLogoDuotone, PiTiktokLogoDuotone } from "react-icons/pi";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { siteConfig } from "@/site.config";
import footerContent from "@/content/footer.json";

const getData = async () => {
  const { data } = await getClient().query({
    query: GET_BRANDS,
  });

  return data.brands?.nodes;
};

const FooterSkeleton = () => (
  <footer className="border-t pb-20 md:pb-0" aria-hidden>
    <div className="container py-8">
      <div className="h-8" />
    </div>
    <div className="bg-primaryColor h-12" />
  </footer>
);

const FooterInner = async () => {
  const brands = await getData();
  const iconSize = 18;

  return (
    <footer className="border-t pb-20 md:pb-0 text-black">

      <div className="container">

        <div className="py-8 flex flex-row gap-6 justify-center">
          <Link className="flex gap-2"
            href={`https://www.facebook.com/${siteConfig.social.facebook}`}
          >
            <PiFacebookLogoDuotone size={32} strokeWidth={1.25} className="text-primaryColor" />
          </Link>
          <Link
            className="flex gap-2"
            href={`https://www.instagram.com/${siteConfig.social.instagram}`}
          >
            <PiInstagramLogoDuotone size={32} strokeWidth={1.25} className="text-primaryColor" />
          </Link>
          <Link
            className="flex gap-2"
            href={`https://www.tiktok.com/${siteConfig.social.tiktok}`}
          >
            <PiTiktokLogoDuotone size={32} strokeWidth={1.25} className="text-primaryColor" />
          </Link>

        </div>

        <div className="pb-8 grid grid-cols-12 gap-x-1 gap-y-3 md:grid-cols-12 xl:grid-cols-12 justify-between">


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
              {footerContent.locations.map((location) => (
                <li key={location.name} className="lg:text-sm text-gray-500 flex gap-3">
                  <div>
                    <MapPinned size={iconSize} className="text-primaryColor" />
                  </div>
                  <div className="flex flex-col">
                    <div>{location.name}</div>
                    <div>{location.address}</div>
                    <div className="flex flex-col mt-2 text-primaryColor">
                      {location.phones.map((phone) => (
                        <Link key={phone.tel} href={`tel:${phone.tel}`}>
                          {phone.display}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="xl:flex gap-1 col-span-6 md:col-span-3 md:gap-3 p-2 flex-col items-center md:items-start">
            <div className="text-base  md:text-lg font-medium text-primaryColor">
              {siteConfig.businessHours.heading}
            </div>
            <ul className="flex text-xs flex-col gap-3 pb-4">
              <li className="lg:text-sm text-gray-500">
                <BusinessHoursList iconSize={iconSize} />
              </li>
              <li className="lg:text-sm text-gray-500 flex gap-3">
                <div>
                  <Mail size={iconSize} className="text-primaryColor" />
                </div>
                <div className="flex flex-col">
                  <div>
                    <Link href={`mailto:${siteConfig.contact.email}`}>
                      {siteConfig.contact.email}
                    </Link>
                  </div>
                </div>
              </li>

              <Link href={"/"} className="flex justify-center pr-16 mt-3">
                <SiteLogoImage
                  width={100}
                  height={80}
                  className="h-28 w-auto rounded-b-2xl md:h-20 lg:h-32"
                />
              </Link>
            </ul>
          </div>


        </div>

      </div>

      <div className="text-center text-xs text-white py-4 bg-primaryColor">
        <div className="container flex gap-4 justify-center flex-wrap">
          <div className="flex gap-2 items-center"><Copyright size={16} /> {new Date().getFullYear()} {siteConfig.brand.legalName}.</div>
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

const Footer = () => (
  <Suspense fallback={<FooterSkeleton />}>
    <FooterInner />
  </Suspense>
);

export default Footer;
