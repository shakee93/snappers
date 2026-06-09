import { gql } from "@apollo/client";



export const CustomerFragment = gql`
   fragment CustomerFragment on Customer {
    email
    displayName
    sessionToken
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
