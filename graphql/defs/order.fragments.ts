import { gql } from "@apollo/client";


export const CustomerAddressFragment = gql`
fragment CustomerAddressFragment on CustomerAddress {
  firstName
  lastName
  address1
  address2
  city
  country
  state
  postcode
}
`;
