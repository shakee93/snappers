// lib/jsonld/productSchema.ts
import { stripHtml } from "@/components/AddressPageComps/HelperComps";

export function getProductSchema(product: any, brand: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripHtml(product.description ?? ""),
    sku: product.slug,
    brand: { "@type": "Brand", name: brand.name },
    image: [
      product.image?.sourceUrl,
      ...(product.galleryImages?.nodes?.map((i: any) => i?.sourceUrl ?? "") || []),
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      url: `https://gqmobiles.lk/${brand.slug}/${product.slug}`,
      price: Number((product.price ?? "0").replace(/[^0-9.]/g, "")),
      priceCurrency: "LKR",
      availability:
        product.stockStatus === "IN_STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "GQ Mobiles" },
    },
    ...(product.variations?.nodes?.length
      ? {
          hasVariant: product.variations.nodes.map((v: any) => ({
            "@type": "Product",
            name: v.name,
            sku: v.databaseId.toString(),
            image: v.image?.sourceUrl,
            color: v.attributes.nodes.find((a: any) => a.name === "pa_color")?.value,
            offers: {
              "@type": "Offer",
              price: v.rawPrice,
              priceCurrency: "LKR",
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              url: `https://gqmobiles.lk/${brand.slug}/${product.slug}`,
              seller: { "@type": "Organization", name: "GQ Mobiles" },
            },
          })),
        }
      : {}),
  };
}