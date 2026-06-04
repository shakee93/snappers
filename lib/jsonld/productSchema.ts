import { stripHtml } from "@/components/global/forms/HelperComps";
import { siteConfig } from "@/site.config";

interface WarrantyInfo {
  duration: number;
  unit: string;
  description: string;
}

interface SchemaAttribute {
  name?: string | null;
  value?: string | null;
}

interface SchemaImage {
  sourceUrl?: string | null;
}

interface SchemaVariationNode {
  name?: string | null;
  databaseId: number;
  image?: SchemaImage | null;
  rawPrice?: string | null;
  attributes?: { nodes?: Array<SchemaAttribute | null> | null } | null;
}

interface SchemaProduct {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  price?: string | null;
  stockStatus?: string | null;
  image?: SchemaImage | null;
  galleryImages?: { nodes?: Array<SchemaImage | null> | null } | null;
  attributes?: { nodes?: Array<SchemaAttribute | null> | null } | null;
  variations?: { nodes?: Array<SchemaVariationNode | null> | null } | null;
}

interface SchemaBrand {
  slug?: string | null;
  name?: string | null;
}

type JsonLd = Record<string, unknown>;

const DEFAULT_WARRANTY: WarrantyInfo = siteConfig.product.defaultWarranty;

function getWarrantySchema(warranty: WarrantyInfo = DEFAULT_WARRANTY): JsonLd {
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

function getBaseOfferSchema(product: SchemaProduct, brand: SchemaBrand): JsonLd {
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

function getProductSpecs(
  source: Pick<SchemaProduct, "attributes">
): JsonLd[] {
  return (
    source.attributes?.nodes
      ?.filter((attr): attr is SchemaAttribute => !!attr && !["pa_color"].includes(attr.name ?? ""))
      .map((attr) => ({
        "@type": "PropertyValue",
        "name": (attr.name ?? "").replace("pa_", "").toUpperCase(),
        "value": attr.value
      })) ?? []
  );
}

export function getProductSchema(product: SchemaProduct, brand: SchemaBrand): JsonLd {
  // If product has variations, return ProductGroup schema
  const variationNodes = product.variations?.nodes?.filter(
    (v): v is SchemaVariationNode => !!v
  );
  if (variationNodes?.length) {
    return {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      "name": product.name,
      "description": stripHtml(product.description ?? ""),
      "productGroupID": product.slug,
      "brand": { "@type": "Brand", name: brand.name },
      "image": product.image?.sourceUrl,
      "variesBy": ["https://schema.org/color"],
      "hasVariant": variationNodes.map((v) => ({
        "@type": "Product",
        "name": v.name,
        "sku": v.databaseId.toString(),
        "image": v.image?.sourceUrl,
        "color": v.attributes?.nodes?.find((a) => a?.name === "pa_color")?.value,
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
      ...(product.galleryImages?.nodes?.map((i) => i?.sourceUrl ?? "") ?? [])
    ].filter(Boolean),
    "offers": getBaseOfferSchema(product, brand),
    "additionalProperty": getProductSpecs(product)
  };
}
