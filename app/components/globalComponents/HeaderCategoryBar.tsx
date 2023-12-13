import Link from "next/link";
import { PhoneCall, MapPin, Facebook, Instagram } from "lucide-react";

const HeaderCategoryBar = () => {
  const brands = [
    {
      id: 1,
      href: "/apple",
      name: "Apple",
    },
    {
      id: 2,
      href: "/samsung",
      name: "Samsung",
    },
    {
      id: 3,
      href: "/page-collection-2",
      name: "Beats",
    },

    {
      id: 4,
      href: "/page-collection-2",
      name: "Huawei",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Sony",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Realme",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "OnePlus",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "JBL",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Honor",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Microsoft",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Microsoft",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Microsoft",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Microsoft",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Microsoft",
    },
    {
      id: 4,
      href: "/page-collection-2",
      name: "Microsoft",
    },
  ];

  return (
    <div className="flex flex-row  bg-primary-200 text-xs text-white">
      <div className="bg-primary-700 w-2/12">All Categories</div>
      <div className="w-10/12 p-2">
        <ul className="flex gap-2 text-[13px] items-center font-medium justify-between text-primary-700 mr-5 w-full">
          {brands.map((item) => (
            <li
              key={item.id}
              className="hover:bg-slate-200 rounded-3xl px-3 py-1 text-center"
            >
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HeaderCategoryBar;
