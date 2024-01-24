import {gql} from "@apollo/client";
import {ProductContentSlice} from "./products.fragments";
import {CustomerAddressFragment} from "./order.fragments";

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
      customer{
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
        id
        databaseId
      }
    }
  }
  ${CustomerAddressFragment}
  
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
  query MyQuery2 {
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

export const GET_GUEST_ORDER = gql`
query getguestorder {
  customer {
    id
    databaseId
    orderCount
    orders {
      nodes {
        date
        id
        orderNumber
        total
        lineItems {
            nodes {
              databaseId
              id
              orderId
              productId
              quantity
              subtotal
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
                  brands {
                    nodes {
                      name
                      slug
                    }
                  }
                }
              }
            }
          }
      }
    }
  }
}`

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
      customer{
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
        id
        databaseId
        lineItems {
        nodes {
          databaseId
          subtotal
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
      shippingTax
      shippingTotal
      orderNumber
      date
      hasBillingAddress
      hasShippingAddress
      needsPayment
      needsProcessing
      needsShippingAddress
      status
      paymentMethod
      lineItems {
        nodes {
          databaseId
          subtotal
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
      }
      orderKey
      paymentMethodTitle
    }
  }
`;

// = {orderId: 10, status: COMPLETED}
export const COMPLETE_ORDER_PAYMENT = gql`
 mutation updatePayment($input: UpdateOrderInput! ) {
  updateOrder(input: $input) {
    clientMutationId
    order {
      status
    }
  }
}
    `