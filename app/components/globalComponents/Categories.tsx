import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";

import { Brand } from "@/graphql/types/graphql";
import { Menu, XIcon, Facebook, Instagram, PhoneCall } from "lucide-react";

const getData = async () => {
  const { data } = await getClient().query({
    query: GET_BRANDS,
  });

  return data.brands.nodes;
};

const Categories = async () => {
  const brands = await getData();

  return (
    <div className="flex gap-1 md:gap-4 p-2 flex-col items-center md:items-center">

      <ul className="text-xs md:text-sm text-gray-500 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
        {brands.map((brand: Brand, index: number) => (
          <li key={index} className="hover:text-primaryColor">
            <Link href={`/${brand.slug}`}>{brand.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
