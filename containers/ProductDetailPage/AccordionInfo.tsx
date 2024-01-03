import { Disclosure } from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import ReactDOMServer from "react-dom/server";
import { GET_TECH_SPEC } from "@/graphql/defs/products";
import { useQuery } from "@apollo/client";

import ProductSpecifications from "@/app/components/SingleProductPage/ProductSpecifications";


const DEMO_DATA = [
  {
    name: "Description",
    content:
      "Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.",
  },
  {
    name: "Fabric + Care",
    content: `<ul class="list-disc list-inside leading-7">
    <li>Made from a sheer Belgian power micromesh.</li>
    <li>
    74% Polyamide (Nylon) 26% Elastane (Spandex)
    </li>
    <li>
    Adjustable hook & eye closure and straps
    </li>
    <li>
    Hand wash in cold water, dry flat
    </li>
  </ul>`,
  },

  {
    name: "How it Fits",
    content:
      "Use this as a guide. Preference is a huge factor — if you're near the top of a size range and/or prefer more coverage, you may want to size up.",
  },
  {
    name: "FAQ",
    content: `
    <ul class="list-disc list-inside leading-7">
    <li>All full-priced, unworn items, with tags attached and in their original packaging are eligible for return or exchange within 30 days of placing your order.</li>
    <li>
    Please note, packs must be returned in full. We do not accept partial returns of packs.
    </li>
    <li>
    Want to know our full returns policies? Here you go.
    </li>
    <li>
    Want more info about shipping, materials or care instructions? Here!
    </li>
  </ul>
    `,
  },
];

interface Props {
  panelClassName?: string;
  data?: typeof DEMO_DATA;
  techspecs: {
    product: {
      metaData: [
        {
          value: string;
        }
      ];
    };
  };  
}


let specifications: { [key: string]: any } = {};

const AccordionInfo: FC<Props> = ({
  panelClassName = "p-4 pt-3 last:pb-0 text-slate-600 text-sm dark:text-slate-300 leading-6",
  data = DEMO_DATA,
  techspecs
}) => {


  if (techspecs) {
    const techValue = techspecs?.product?.metaData[0]?.value;
    specifications = JSON.parse(techValue);
  }


  return (
    <div className="w-full rounded-2xl space-y-2.5">
      {/* ============ */}
      {data.map((item, index) => {
        return (
          <Disclosure key={index} defaultOpen={index < 2}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 font-medium text-left bg-slate-100/80 hover:bg-slate-200/60 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-slate-500 focus-visible:ring-opacity-75 ">
                  <span>{item.name}</span>
                  {!open ? (
                    <PlusIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <MinusIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  )}
                </Disclosure.Button>
                <Disclosure.Panel
                  className={panelClassName}
                  as="div"
                >

                  {/* TODO: pass the techspecs prop to ProductSpecifications */}
                  {specifications && specifications.items && specifications.items.length > 0 && item.name === "Specifications" &&
                    <ProductSpecifications techspecs={specifications} />
                  }
                  {item.name !== "Specifications" && (
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        );
      })}

      {/* ============ */}
    </div>
  );
};

export default AccordionInfo;
