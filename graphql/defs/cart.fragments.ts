import { gql } from '@apollo/client';
import { ProductVariationContentSlice } from "@/graphql/defs/products.fragments";

// Slim product slice for cart-item rendering. Only fields that cart UI
// (CartDropdownItem, /cart, /checkout) actually reads. The PDP/listing
// fragments (ProductContentSlice, ProductContentCard, ProductContentFull)
// stay rich; cart traffic does not pay for them.
export const CartItemProductSlim = gql`
    fragment CartItemProductSlim on Product {
        id
        databaseId
        name
        slug
        type
        image {
            id
            sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
            altText
        }
        brands {
            nodes {
                databaseId
                name
                slug
                count
                brandImage
            }
        }
        # productTags is required for pre-order detection in CartProvider.
        productTags(first: 20) {
            nodes {
                id
                slug
                name
            }
        }
        # productCategories is required for the mobile/tablet category check
        # in checkout (PaymentMethod.tsx, UnifiedCheckoutForm.tsx).
        productCategories {
            nodes {
                id
                name
            }
        }
        # Parent free-shipping flag — fallback when the cart line's variation
        # has no explicit value. Variation flag is on ProductVariationContentSlice.
        freeShippingMeta: metaData(keysIn: ["_wc_product_free_shipping"]) {
            key
            value
        }
        ... on SimpleProduct {
            price
            regularPrice
            stockStatus
            stockQuantity
            manageStock
        }
        ... on VariableProduct {
            price
            regularPrice
        }
    }
`;

export const CartItemContent = gql`
    fragment CartItemContent on CartItem {
        key
        product {
            node {
                ...CartItemProductSlim
            }
        }
        variation {
            attributes {
                label
                name
                value
                # displayValue is provided by the graphql-cart-attribute-display-value
                # mu-plugin and resolves the human-readable term name. Replaces the
                # previous product[allPa+label] dynamic lookup, so the cart fragment
                # no longer needs the 13 allPa* taxonomies.
                displayValue
            }
            node {
                ...ProductVariationContentSlice
            }
        }
        quantity
        total
        subtotal
    }
    ${CartItemProductSlim}
    ${ProductVariationContentSlice}
`;

// Slim cart fragment for AddToCart. The sidecart (CartDropdown / SideCart /
// MobileBottomNav) is the only surface that reads the response, and it only
// renders contents + subtotal. Dropping shippingTotal/total/etc. avoids
// triggering WC's shipping-zone evaluation and full calculate_totals on
// every add — saved ~1.7s of TTFB in measurements.
export const CartContentSlim = gql`
  fragment CartContentSlim on Cart {
    contents(first: 100) {
      itemCount
      nodes {
        ...CartItemContent
      }
    }
    subtotal
  }
  ${CartItemContent}
`;

// Full cart fragment for /cart and /checkout. Trimmed to fields with actual
// consumers — subtotalTax / shippingTax / totalTax / feeTax / feeTotal /
// discountTax / needsShippingAddress / appliedCoupons.discountTax all had
// zero readers in the codebase.
export const CartContent = gql`
  fragment CartContent on Cart {
    contents(first: 100) {
      itemCount
      nodes {
        ...CartItemContent
      }
    }
    appliedCoupons {
      code
      discountAmount
    }
    subtotal
    shippingTotal
    total
    discountTotal
  }
  ${CartItemContent}
`;
