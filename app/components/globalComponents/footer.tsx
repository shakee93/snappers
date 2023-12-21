import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";

const Footer = () => {
  return (
    <footer className=" bg-blue-50 border-t-1 border-gray-400 mb-16 md:mb-0 text-black">
      <div className="container p-4 grid grid-cols-1 gap-3 md:grid-cols-4 justify-between">
        <div className=" flex gap-1 md:gap-2 p-2 flex-col items-center md:items-start">
          <Link href={"/"}>
            <Image
              width={200}
              src={SiteLogo}
              alt="logo"
              className="h-20 md:h-28  lg:h-32  w-auto rounded-b-2xl"
            />
          </Link>
          <div className="text-base md:text-lg font-medium text-primaryColor">About us</div>
          <div className="text-xs md:text-sm text-gray-500 text-center md:text-left">
            GQ the Mobile Store Unlimited carries a wide selection of mobile
            phones and tablets fresh from release, with prices that will suit
            every budget.
          </div>
        </div>
        <div className="flex gap-1 md:gap-2 p-2 flex-col items-center md:items-start">
          <div className="text-base md:text-lg font-medium text-primaryColor">Quick Links</div>
          <ul className="text-xs md:text-sm text-gray-500 flex flex-col gap-3 pl-4  list-disc">
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Home</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>About us</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Stores</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Contact Us</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Privacy Policy</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Terms & Conditions</Link>
            </li>
          </ul>
        </div>
        <div className="flex gap-1 md:gap-2 p-2 flex-col items-center md:items-start">
          <div className="text-base md:text-lg font-medium text-primaryColor">Top Brands</div>
          <ul className="text-xs md:text-sm text-gray-500 grid grid-cols-3  gap-x-8 gap-y-3   list-disc">
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Apple</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Bose</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Samsung</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>OnePlus</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Google</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Amazfit</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Honor</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Huawei</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Beats</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>ZTE</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>JBL</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Xiaomi</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Asus</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Fitbit</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Microsoft</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Oppo</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Tecno</Link>
            </li>
            <li className="hover:text-primaryColor">
              <Link href={"/"}>Sony</Link>
            </li>
          </ul>
        </div>
        <div className=" flex gap-3 md:gap-2 p-2 flex-col items-center md:items-start">
          <div className="text-base md:text-lg font-medium text-primaryColor">
            Sign up to Newsletter
          </div>

          <div className="text-xs md:text-sm text-gray-500 text-center md:text-left">
            Stay up to date with the roadmap progress, announcements and
            exclusive discounts feel free to sign up with your email.
          </div >
          <div className="relative w-full flex">
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
          </div>
        </div>
      </div>
      <div className=" text-center text-sm text-white py-2 bg-primaryColor">
        Copyright ©️ 2024 GQ Mobile (Pvt) Ltd.
      </div>
    </footer>
  );
};

export default Footer;
