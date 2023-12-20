// graphql/posts.js
import {gql} from '@apollo/client';

export const GET_POST_SLUGS = gql`
    query posts {
        posts {
            nodes {
                slug
            }
        }
    }
`;

export const GET_POST = gql`
    query GetPost($postId: ID!) {
        post(id: $postId, idType: SLUG) {
            content
            slug
            databaseId
        }
    }
`;
