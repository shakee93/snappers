import React, { FC, useState, useCallback, useEffect } from "react";
import { useStore } from "@/store/store";
import LikeButton from "@/app/components/LikeButton";
import {
  NoSymbolIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import IconDiscount from "@/components/IconDiscount";
import { toast } from "sonner";
import NotifyAddTocart from "./NotifyAddTocart";
import AccordionInfo from "@/containers/ProductDetailPage/AccordionInfo";
import Image from "next/image";
import useProductLink from "@/hooks/useProductLink";

import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import {
  ProductAttribute,
  ProductVariation,
} from "@/graphql/types/graphql";

import { GET_TECH_SPEC } from "@/graphql/defs/products";
import { useLazyQuery, useQuery } from "@apollo/client";
import ProductDetails from "@/app/components/SingleProductPage/ProductDetailsQuickView";
import { Loader } from "lucide-react";

export interface ProductQuickViewProps {
  className?: string;
  product: SimpleProduct & VariableProduct;
  brands?: any;
}

const ProductQuickView: FC<ProductQuickViewProps> = ({
  className = "",
  product,
  brands,
}) => {
  const [variantActive, setVariantActive] = React.useState(0);
  const [sizeSelected, setSizeSelected] = React.useState("");
  const [qualitySelected, setQualitySelected] = React.useState(1);
  const {
    product: { attribute },
    setAttribute,
  } = useStore();
  const [techspecs, setTechSpecs] = React.useState(null);

  const [manualTechSpecs, setManualTechSpecs] = useState<any>([]);

  const [activeVariation, setActiveVariation] = useState<any>(
    !!product && "variations" in product && product.variations?.nodes?.length
      ? product.variations.nodes[0]
      : null
  );

  const link = useProductLink(product);

  // let brand = product?.brands?.nodes[0]?.name;

  let product_images: string[] = [];
  product_images = [
    product?.image?.sourceUrl ?? "",
    product?.galleryImages?.nodes[0]?.sourceUrl ?? "",
    product?.galleryImages?.nodes[1]?.sourceUrl ?? "",
  ];

  // console.log({ product });

  const [getTechSpec, { loading, error, data }] = useLazyQuery(GET_TECH_SPEC, {
    variables: {
      productId: product?.databaseId,
    },
  });



  useEffect(() => {

    (async () => {


      const { data: dataIn } = await getTechSpec()

      if (dataIn) {
        setTechSpecs(dataIn);

        // console.log(dataIn);

        const manualMeta = dataIn?.product?.metaData;
        const techSpecDataObject = manualMeta?.find(
          (item: any) => item?.key === "tech_spec_data"
        );
        const parsedMetaData = techSpecDataObject?.value
          ? JSON.parse(techSpecDataObject.value)
          : null;

        setManualTechSpecs(parsedMetaData ? Object.entries(parsedMetaData) : [])

      }

    })()

  }, [data]);

  const activeAttr = useCallback(
    (attr: ProductAttribute) => {
      return attribute.find((a) => a.name === attr.name);
    },
    [attribute]
  );

  const notifyAddTocart = () => {

  };

  const renderVariants = () => {
    if (!product.variations || !product.variations?.nodes?.length) {
      return null;
    }

    return (
      <div>
        <label htmlFor="">
          <span className="text-sm font-medium">
            Variations:
            <span className="ml-1 font-semibold">
              {/* {variants[variantActive].name} */}
            </span>
          </span>
        </label>
        <div className="flex mt-2.5">
          {product?.variations?.nodes?.map(
            (variant: ProductVariation, index) => (
              <div
                key={index}
                onClick={() => setVariantActive(index)}
                className={`w-auto relative flex-1 max-w-[75px] h-16 rounded-full border-2 cursor-pointer ${variantActive === index
                  ? "border-primary-6000 dark:border-primary-500"
                  : "border-transparent"
                  }`}
              >
                <div className="absolute inset-0.5 rounded-full overflow-hidden z-0">
                  <Image
                    fill
                    style={{ objectFit: "cover" }}
                    src={variant?.image?.sourceUrl || ""}
                    alt=""
                    className="absolute w-full h-full object-cover"
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const CLASSES =
      "absolute top-3 left-3 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 nc-shadow-lg rounded-full flex items-center justify-center text-slate-700 text-slate-900 dark:text-slate-300";
    if (status === "New in") {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "50% Discount") {
      return (
        <div className={CLASSES}>
          <IconDiscount className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "Sold Out") {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === "limited edition") {
      return (
        <div className={CLASSES}>
          <ClockIcon className="w-3.5 h-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    return null;
  };

  // console.log("product", product);

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">

        <ProductDetails brand={brands} product={product} />

        <hr className=" border-slate-200 dark:border-slate-700"></hr>

        <AccordionInfo
          data={[
            {
              name: "Description",
              content: product?.description ?? "",
            },
            {
              name: "Specifications",
              content: product?.description ?? "",
            },
          ]}
          techspecs={techspecs}
          manualSpecs={manualTechSpecs}
        />
      </div>
    );
  };

  return (
    <div className={`nc-ProductQuickView ${className}`}>

      {!product ? <div className='min-h-[500px]'>
        <div className='absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2'>
          <Loader className='animate-spin ' />
        </div>
      </div> :
        <div className="lg:flex">
          {/* CONTENT */}
          <div className="w-full lg:w-[50%] ">
            {/* HEADING */}
            <div className="relative">
              <div className="aspect-w-16 aspect-h-16">
                <Image
                  fill
                  style={{ objectFit: "contain" }}
                  src={product_images[0]}
                  className="w-full rounded-xl object-cover"
                  alt="product detail 1"
                />
              </div>

              {/* STATUS */}
              {renderStatus()}
              {/* META FAVORITES */}
              <LikeButton className="absolute right-3 top-3 " />
            </div>
            {(product?.galleryImages?.nodes ||
              (product?.galleryImages?.edges &&
                product?.galleryImages?.edges?.length > 0)) && (
                <div className="hidden lg:grid grid-cols-2 gap-3 mt-3 sm:gap-6 sm:mt-6 xl:gap-5 xl:mt-5">
                  {product_images.slice(1).map((item, index) => {
                    if (item) {
                      return (
                        <div key={index} className="aspect-w-3 aspect-h-4">
                          <Image
                            fill
                            style={{ objectFit: "contain" }}
                            src={item}
                            className="w-full rounded-xl object-contain"
                            alt={`product detail ${index + 2}`}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-[50%] pt-6 lg:pt-0 lg:pl-7 xl:pl-8">
            {renderSectionContent()}
          </div>
        </div>}
    </div>
  );
};

export default ProductQuickView;
