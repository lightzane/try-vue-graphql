import gql from 'graphql-tag';

export const BOOK_FRAGMENTS = gql`
  fragment BookFragment on Book {
    id
    title
    rating
  }
`;

// Auto-completion also works with the vscode extension and apollo.config.js
export const ALL_BOOKS_QUERY = gql`
  query GetAllBooks($title: String) {
    books(title: $title) {
      ...BookFragment
    }
  }

  ${BOOK_FRAGMENTS}
`;

export const UPDATE_RATING_MUTATION = gql`
  mutation UpdateBookRating($id: ID!, $rating: Float!) {
    updateBook(input: { id: $id, rating: $rating }) {
      ...BookFragment
    }
  }

  ${BOOK_FRAGMENTS}
`;
