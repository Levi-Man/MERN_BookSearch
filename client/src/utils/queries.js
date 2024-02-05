import { gql } from '@apollo/client';

// Define the QUERY_ME query
export const QUERY_ME = gql`
  query {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;
