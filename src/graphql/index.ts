import gql from 'graphql-tag';

export const ALL_BOOKS_QUERY = gql`
  query GetAllBooks {
    books {
      id
      title
      description
      rating
      author
      year
    }
  }
`;
