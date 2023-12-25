import { gql } from "@apollo/client";



export const AccountDetailsFragment = gql`
   fragment CustomerFragment on Customer {
    email
    displayName
    billing {
      address1
      phone
      email
    }
    metaData(multiple: true) {
      key
      value
      id
    }
    username
    id
  }
`;
