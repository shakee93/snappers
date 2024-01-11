import { gql } from "@apollo/client";
import { ProductContentSlice } from "./products.fragments";
import { CustomerAddressFragment } from "./order.fragments";

export const CHECKOUT_MUTATION = gql`
  mutation Checkout($paymentMethod: String!) {
    checkout(input: { paymentMethod: $paymentMethod }) {
      clientMutationId
      order {
        id
        orderKey
        total
      }
    }
  }
`;

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
      clientMutationId
      order {
        id
        orderKey
        total
        orderNumber
        paymentMethodTitle
      }
    }
  }
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
    }
  }
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
    order(id: $orderID) {
      id
      subtotal
      total
      shippingTax
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
