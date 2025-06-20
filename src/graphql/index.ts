import gql from 'graphql-tag';

// Auto-completion also works with the vscode extension and apollo.config.js
export const ALL_BOOKS_QUERY = gql`
  query GetAllBooks($title: String) {
    books(title: $title) {
      id
      title
      description
      rating
      author
      year
    }
  }
`;
