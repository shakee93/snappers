import { stripHtml } from "@/components/ui/AddressPageComps/HelperComps";
import { Product, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { siteConfig } from "@/site.config";

interface ProductSpec {
  name: string;
  value: string;
}

interface WarrantyInfo {
  duration: number;
  unit: string;
  description: string;
}

const DEFAULT_WARRANTY: WarrantyInfo = siteConfig.product.defaultWarranty;

function getWarrantySchema(warranty: WarrantyInfo = DEFAULT_WARRANTY) {
  return {
    "@type": "WarrantyPromise",
    "durationOfWarranty": {
      "@type": "QuantitativeValue",
      "value": warranty.duration.toString(),
      "unitCode": warranty.unit
    },
    "warrantyScope": {
      "@type": "WarrantyScope",
      "description": warranty.description
    }
  };
}

function getBaseOfferSchema(product: any, brand: any) {
  return {
    "@type": "Offer",
    "url": `${siteConfig.url.base}/${brand.slug}/${product.slug}`,
    "price": Number((product.price ?? "0").replace(/[^0-9.]/g, "")),
    "priceCurrency": siteConfig.locale.currencyCode,
    "availability": product.stockStatus === "IN_STOCK"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "Organization", name: siteConfig.brand.name },
    "warranty": getWarrantySchema()
  };
}

function getProductSpecs(product: any): ProductSpec[] {
  // Extract specifications from product attributes or custom fields
  // This is a placeholder - you'll need to implement the actual logic based on your data structure
  const specs = product.attributes?.nodes?.filter((attr: any) => 
    !['pa_color'].includes(attr.name)
  ).map((attr: any) => ({
    "@type": "PropertyValue",
    "name": attr.name.replace('pa_', '').toUpperCase(),
    "value": attr.value
  })) || [];

  return specs;
}

export function getProductSchema(product: any, brand: any) {
  // If product has variations, return ProductGroup schema
  if (product.variations?.nodes?.length) {
    return {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      "name": product.name,
      "description": stripHtml(product.description ?? ""),
      "productGroupID": product.slug,
      "brand": { "@type": "Brand", name: brand.name },
      "image": product.image?.sourceUrl,
      "variesBy": ["https://schema.org/color"],
      "hasVariant": product.variations.nodes.map((v: any) => ({
        "@type": "Product",
        "name": v.name,
        "sku": v.databaseId.toString(),
        "image": v.image?.sourceUrl,
        "color": v.attributes.nodes.find((a: any) => a.name === "pa_color")?.value,
        "offers": {
          ...getBaseOfferSchema(product, brand),
          "price": Number((v.rawPrice ?? product.price ?? "0").toString().replace(/[^0-9.]/g, "") || "0")
        },
        "additionalProperty": getProductSpecs(v)
      })),
      "additionalProperty": getProductSpecs(product)
    };
  }

  // For simple products, return Product schema
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": stripHtml(product.description ?? ""),
    "sku": product.slug,
    "brand": { "@type": "Brand", name: brand.name },
    "image": [
      product.image?.sourceUrl,
      ...(product.galleryImages?.nodes?.map((i: any) => i?.sourceUrl ?? "") || [])
    ].filter(Boolean),
    "offers": getBaseOfferSchema(product, brand),
    "additionalProperty": getProductSpecs(product)
  };
} 