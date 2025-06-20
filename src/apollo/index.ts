import { ALL_BOOKS_QUERY } from '@/graphql';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client/core';

const link = createHttpLink({
  uri: 'http://localhost:4000',
});

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
