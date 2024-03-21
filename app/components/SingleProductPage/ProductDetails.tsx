"use client";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
  Brand,
  PaCapacity,
  ProductAttribute,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  VariationAttribute,
} from "@/graphql/types/graphql";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { twMerge } from "tailwind-merge";
import parseHtml from "html-react-parser";
import { useImage } from "@/context/ImageChangeGrabber";
import brandColors from '@/data/brandColors';


const ProductDetails = ({
  product,
  brand,
}: {
  product: VariableProduct & SimpleProduct;
  brand: Brand;
}) => {

  const { product: { attribute }, setAttribute } = useStore();

  const [activeVariation, setActiveVariation] = useState<any>(product?.variations?.nodes[0]);
  const [activeOption, setActiveOption] = useState(
    !!product?.variations?.nodes?.length
      ? product?.variations?.nodes[0].attributes?.nodes[0].value
      : null
  );


  const { setVariationId } = useImage();

  useEffect(() => {
    if (product.type === "VARIABLE") {
      const defAttributes = product?.defaultAttributes?.nodes;
      product?.attributes?.nodes.map((attr: ProductAttribute) => {
        setAttribute(attr, (attr?.options && attr?.options[0]) || "");
      });
      defAttributes?.forEach((defAttr: VariationAttribute) => {
        setAttribute(defAttr, defAttr.value || "");
      });
    }
  }, []);

  useEffect(() => {
    setVariationId(activeVariation?.image.databaseId);
  }, [activeVariation]);

  const activeAttr = useCallback(
    (attr: ProductAttribute) => {
      return attribute.find((a) => a.name === attr.name);
    },
    [attribute]
  );

  useEffect(() => {
    if (product.type === "VARIABLE" && product?.variations?.nodes?.length !== undefined && product.variations.nodes.length > 0) {
      setActiveVariation(product?.variations?.nodes[0]);
    } else if (product.type === "SIMPLE") {
      // Handle simple product case
      setActiveVariation(product);
    }
  }, [product]);

  useEffect(() => {
    if (product.type === "VARIABLE" && activeVariation) {
      setVariationId(activeVariation?.image.databaseId);
    }
  }, [activeVariation]);

  useEffect(() => {
    if (product.type === "VARIABLE") {
      let variation = (product as VariableProduct).variations
        ?.nodes as unknown as ProductVariation[];
      let vProduct = variation.find((v) => {
        let nodes = v.attributes?.nodes as unknown as VariationAttribute[];
        let attrKey = attribute.map((a) => `${a.name}:${a.val}`).join("+");
        let variationKey = nodes?.map((a) => `${a.name}:${a.value}`).join("+");
        return attrKey === variationKey;
      });

      if (vProduct) {
        setActiveVariation(vProduct);
      }

    }
  }, [attribute]);


  const applyListStyleDisc = (htmlContent: any) => {
    return htmlContent.replace(/<ul>/g, '<ul class="list-disc">');
  };

  const brandColorClass = brand?.name && brandColors[brand?.name.toLowerCase()];


  return (
    <>
      <div className="flex gap-1  text-sm text-gray-500">
        Brand : <Link href={`/${brand?.slug}`} target="_blank" className={`${brandColorClass}`} >{brand?.name}</Link>
      </div>

      <div className="text-base md:text-lg font-medium ">
        {product.name} - {product.databaseId}
      </div>


      {product.shortDescription && (
        <div
          className="text-xs md:text-sm text-gray-600"
          dangerouslySetInnerHTML={{
            __html: applyListStyleDisc(product.shortDescription)
          }}
        />
      )}
      {/* <h1 className="text-2xl font-bold">{JSON.stringify(activeVariation)}</h1> */}
      {product.type === "VARIABLE" && (
        <>
          {product.attributes?.nodes.map(
            (attr: ProductAttribute, index: number) => (
              <div key={index} className="py-2 text-gray-500">
                <div className="text-sm py-2">
                  {attr.label}:{" "}
                  <span className="font-medium text-gray-700">
                    {
                      (product as unknown as VariableProduct)[
                        `allPa${attr?.label as unknown as "Capacity"}`
                      ]?.nodes.find(
                        (node: PaCapacity) =>
                          node.slug === activeAttr(attr)?.val
                      )?.name
                    }
                  </span>{" "}
                </div>

                <ul className="flex gap-2 flex-wrap text-sm items-center">
                  {attr.options?.map((option, index) => (
                    <li
                      key={index}
                      onClick={(e) => setAttribute(attr, option || "")}
                      className={twMerge(
                        "border bg-gray-200/80 cursor-pointer text-black inline-block py-2 px-3.5  text-xs md:text-sm rounded",
                        activeAttr(attr)?.val === option &&
                        " border-blue-700 bg-white"
                      )}
                    >
                      {
                        (product as any)
                        [
                          `allPa${(attr?.label as unknown as "Capacity")?.split(' ').join('')}`
                        ]?.nodes.find((node: PaCapacity) => {
                          return node.slug === option;
                        })?.name || "OPTION"
                      }
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </>
      )}

      {product.type === "VARIABLE" && activeVariation ? (
        <div>
          <div className="flex items-center gap-4 text-base py-2 flex-wrap md:text-xl font-medium text-gray-600">
            <span dangerouslySetInnerHTML={{ __html: activeVariation.price }} />

            {!!activeVariation.salePrice &&
              activeVariation.salePrice !== activeVariation.regularPrice && (
                <span className="text-red-400 line-through md:text-sm">
                  <span dangerouslySetInnerHTML={{ __html: activeVariation.regularPrice }} />
                </span>
              )}

          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-base py-2 flex-wrap md:text-xl font-medium text-gray-600">
          <span dangerouslySetInnerHTML={{ __html: product.price || '' }} />

          {!!product.salePrice &&
            product.salePrice !== product.regularPrice && (
              <span className="text-red-400 line-through md:text-sm">
                <span dangerouslySetInnerHTML={{ __html: product.regularPrice || '' }} />
              </span>
            )}
        </div>
      )}

      {product.type === "SIMPLE" && product.stockStatus !== "IN_STOCK" && (
        <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1">
          Sold Out
        </div>
      )}

      {product.type === "VARIABLE" &&
        activeVariation?.stockStatus !== "IN_STOCK" && (
          <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1 mb-1">
            Sold Out
          </div>
        )}

      {product.type === "VARIABLE" &&
        activeVariation?.stockStatus == "IN_STOCK" && activeVariation?.stockQuantity &&
        activeVariation?.stockQuantity <= 2 && (
          <div className="w-max px-4 bg-yellow-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1 mb-1">
            Low Stock
          </div>
        )}

      {product.type === "SIMPLE" && product.stockStatus == "IN_STOCK" && product?.stockQuantity &&
        product?.stockQuantity <= 2 && (
          <div className="w-max px-4 bg-yellow-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1 mb-1">
            Low Stock
          </div>
        )}



      <ProductAddToCart product={product} variation={activeVariation} />
      <div className="flex gap-1 w-full items-center flex-wrap text-sm md:text-base text-gray-500">
        <div className="text-sm py-2">Category:</div>
        {product.productCategories?.edges.map(
          (category: any, index: number) => (
            <Link
              href={`/collections/${category.node.slug}`}
              key={index}
              className="bg-primary-100 inline-block py-1 px-2 min-w-max  text-xs md:text-sm rounded-3xl"
            >
              {category.node.name}
            </Link>
          )
        )}
      </div>
    </>
  );
};

export default ProductDetails;
