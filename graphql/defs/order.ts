import { gql } from "@apollo/client";
import { ProductContentSlice } from "./products.fragments";
import { CustomerAddressFragment } from "./order.fragments";

// export const CHECKOUT_MUTATION = gql`
//   mutation Checkout($paymentMethod: String!) {
//     checkout(input: { paymentMethod: $paymentMethod }) {
//       clientMutationId
//       order {
//         id
//         orderKey
//         total
//       }
//     }
//   }
// `;

export const GUEST_CHECKOUT_MUTATION = gql`
  mutation guestCheckout(
    $paymentMethod: String!
    $lineItems: [LineItemInput!]!
    $shippingLines: [ShippingLineInput]
  ) {
    createOrder(
      input: {
        paymentMethod: $paymentMethod
        lineItems: $lineItems
        shippingLines: $shippingLines
      }
    ) {
      order {
        total
        orderNumber
        paymentMethodTitle
      }
    }
  }
`;

// id
// orderKey

export const GUEST_CHECKOUT = gql`
  mutation checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      clientMutationId
      redirect
      result
      customer {
        displayName
        shipping {
          ...CustomerAddressFragment
        }
        billing {
          ...CustomerAddressFragment
        }
        email
      }
      order {
        total
        subtotal
        shippingTotal
        date
        id
        databaseId
        lineItems {
          nodes {
            databaseId
            subtotal
            total
            quantity
            product {
              node {
                ...ProductContentSlice
              }
            }
            variation {
              node {
                databaseId
                name
                price
                regularPrice
                soldIndividually
              }
            }
          }
        }
      }
    }
  }
  ${CustomerAddressFragment}
  ${ProductContentSlice}
`;

export const PAYMENT_DETAILS = gql`
  query paymentDetails {
    customer(id: "") {
      availablePaymentMethods {
        gateway {
          id
          title
        }
      }
      availablePaymentMethodsCC {
        cardType
        expiryMonth
        expiryYear
        id
      }
    }
  }
`;

export const GET_ALL_ORDER_DETAILS = gql`
  query GET_ORDRE_DETAILS {
    orders {
      edges {
        node {
          orderNumber
          shipping {
            address1
          }
          date
          total
          subtotal
          lineItems {
            nodes {
              product {
                node {
                  ...ProductContentSlice
                }
              }
              total
            }
          }
          currency
          datePaid
          id
          pricesIncludeTax
          needsProcessing
          needsShippingAddress
          needsPayment
          status
        }
      }
    }
  }
  ${ProductContentSlice}
`;

export const GET_MY_ORDERS = gql`
  query getMyOrders {
    customer {
      id
      databaseId
      orderCount
      orders {
        nodes {
          date
          id
          databaseId
          orderNumber
          total
          subtotal
          status
          paymentMethod
          paymentMethodTitle
          shippingTotal
          billing {
            ...CustomerAddressFragment
          }
          shipping {
            ...CustomerAddressFragment
          }
          shippingLines {
            nodes {
              methodTitle
              total
            }
          }
          metaData {
            id
            key
            value
          }
          lineItems {
            nodes {
              databaseId
              id
              orderId
              productId
              quantity
              subtotal
              total
              product {
                node {
                  databaseId
                  featuredImage {
                    node {
                      sourceUrl
                    }
                  }
                  id
                  name
                  slug
                  productId
                  type
                  brands {
                    nodes {
                      name
                      slug
                    }
                  }
                }
              }
              variation {
                node {
                  name
                  attributes {
                    nodes {
                      label
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${CustomerAddressFragment}
`;

export type MyOrderAddress = {
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  postcode?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type MyOrderProduct = {
  databaseId?: number | null;
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  type?: string | null;
  featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
};

export type MyOrderLineItem = {
  databaseId?: number | null;
  id: string;
  orderId?: number | null;
  productId?: number | null;
  quantity?: number | null;
  subtotal?: string | null;
  total?: string | null;
  product?: { node?: MyOrderProduct | null } | null;
  variation?: {
    node?: {
      name?: string | null;
      attributes?: {
        nodes?: Array<{
          label?: string | null;
          name?: string | null;
          value?: string | null;
        } | null> | null;
      } | null;
    } | null;
  } | null;
};

export type MyOrder = {
  date?: string | null;
  id: string;
  databaseId?: number | null;
  orderNumber?: string | null;
  total?: string | null;
  subtotal?: string | null;
  status?: string | null;
  paymentMethod?: string | null;
  paymentMethodTitle?: string | null;
  shippingTotal?: string | null;
  billing?: MyOrderAddress | null;
  shipping?: MyOrderAddress | null;
  shippingLines?: {
    nodes?: Array<{
      methodTitle?: string | null;
      total?: string | null;
    } | null> | null;
  } | null;
  metaData?: Array<{
    id?: string | null;
    key?: string | null;
    value?: string | null;
  } | null> | null;
  lineItems?: { nodes?: Array<MyOrderLineItem | null> | null } | null;
};

export type GetMyOrdersQuery = {
  customer?: {
    id?: string | null;
    databaseId?: number | null;
    orderCount?: number | null;
    orders?: { nodes?: Array<MyOrder | null> | null } | null;
  } | null;
};

export const GET_ADDRESSES = gql`
  query getShippingDetails {
    customer {
      billing {
        ...CustomerAddressFragment
      }
      shipping {
        ...CustomerAddressFragment
      }
    }
  }
  ${CustomerAddressFragment}
`;

export const GET_CHECKOUT_USER_DETAILS = gql`
  query GET_CHECKOUT_USER_DETAILS {
    customer {
      displayName
      shipping {
        ...CustomerAddressFragment
      }
      billing {
        ...CustomerAddressFragment
      }
      orders {
        nodes {
          id
          databaseId
        }
      }
      email
    }
  }
  ${CustomerAddressFragment}
`;

export const CHECKOUT = gql`
  mutation checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      clientMutationId
      redirect
      result
      customer {
        displayName
        shipping {
          ...CustomerAddressFragment
        }
        billing {
          ...CustomerAddressFragment
        }
        email
      }
      order {
        total
        subtotal
        shippingTotal
        date
        id
        databaseId
        lineItems {
          nodes {
            databaseId
            subtotal
            total
            quantity
            product {
              node {
                name
                databaseId
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${CustomerAddressFragment}
`;

export const UPDATE_ADDRESS = gql`
  mutation updateCustomerAddress($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        billing {
          ...CustomerAddressFragment
        }
        shipping {
          ...CustomerAddressFragment
        }
      }
    }
  }

  ${CustomerAddressFragment}
`;

export const GET_SINGLE_ORDER = gql`
  query getOrder($orderID: ID!) {
    order(id: $orderID, idType: DATABASE_ID) {
      id
      subtotal
      total
      discountTotal
      discountTax
      shippingTax
      shippingTotal
      orderNumber
      customerNote
      date
      hasBillingAddress
      hasShippingAddress
      needsPayment
      needsProcessing
      needsShippingAddress
      status
      paymentMethod
      couponLines {
        nodes {
          code
          discount
          discountTax
        }
      }
      lineItems {
        nodes {
          databaseId
          subtotal
          total
          quantity
          variation {
            node {
              name
              price
              regularPrice
            }
          }
          product {
            node {
              name
              databaseId
              brands {
                nodes {
                  databaseId
                  name
                  slug
                  count
                }
              }
              featuredImage {
                node {
                  sourceUrl
                }
              }
              image {
                id
                sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
                altText
              }
              ... on SimpleProduct {
                price
                regularPrice
                soldIndividually
                brands {
                  nodes {
                    id
                    name
                    slug
                  }
                }
              }
              productCategories {
                nodes {
                  id
                  name
                }
              }
              ... on VariableProduct {
                allPaCapacity {
                  nodes {
                    name
                    slug
                  }
                }
                allPaConnectivity {
                  nodes {
                    name
                    slug
                  }
                }
                allPaColor {
                  nodes {
                    name
                    slug
                  }
                }
                allPaColour {
                  nodes {
                    name
                    slug
                  }
                }
                allPaSpecification {
                  nodes {
                    name
                    slug
                  }
                }
                allPaVariant {
                  nodes {
                    name
                    slug
                  }
                }
                allPaWarranty {
                  nodes {
                    name
                    slug
                  }
                }
                allPaModel {
                  nodes {
                    name
                    slug
                  }
                }
                allPaPacks {
                  nodes {
                    name
                    slug
                  }
                }
                allPaWatchSize {
                  nodes {
                    name
                    slug
                  }
                }
                allPaSize {
                  nodes {
                    name
                    slug
                  }
                }
                allPaConnectorType {
                  nodes {
                    name
                    slug
                  }
                }
                allPaAmount {
                  nodes {
                    name
                    slug
                  }
                }
                price
                regularPrice
                soldIndividually
                brands {
                  nodes {
                    id
                    name
                    slug
                  }
                }
              }
            }
          }
        }
      }
      customer {
        displayName
        email
        firstName
        lastName
        shipping {
          city
          address1
          address2
          phone
        }
        billing {
          city
          address1
          address2
          phone
        }
      }
      orderKey
      paymentMethodTitle
    }
  }
`;

// = {orderId: 10, status: COMPLETED}
export const COMPLETE_ORDER_PAYMENT = gql`
  mutation updatePayment($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      clientMutationId
      order {
        status
      }
    }
  }
`;
