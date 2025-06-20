import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client/core';

const link = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
