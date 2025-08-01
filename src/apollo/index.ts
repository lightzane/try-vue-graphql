import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client/core'; // For Vue, must import from the `core` module
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'; // https://www.apollographql.com/docs/react/data/subscriptions#2-initialize-a-graphqlwslink
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

import typeDefs from './../graphql/local/typedefs.graphql';
import FAVORITE_BOOKS_QUERY from './../graphql/local/FavoriteBooks.query.graphql';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
  })
);

// Reference: https://www.apollographql.com/docs/react/data/subscriptions#3-split-communication-by-operation-recommended
// The split function takes three parameters:
//
// * 1. A function that's called for each operation to execute
// * 2. The Link to use for an operation if the function returns a "truthy" value
// * 3. The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  // param 1
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink, // param 2 - will be used if operations are subscription
  httpLink // param 3
);

const cache = new InMemoryCache({
  typePolicies: {
    // Reference: https://www.apollographql.com/docs/react/caching/cache-configuration#typepolicy-fields
    BookShelfLabel: {
      // [TIP] Observe browser's network via devtools to see the `__typename`
      // In this case, __typename: "BookShelfLabel"
      keyFields: ['name'], // Be sure that `name` field is unique "globally"
      // => This field prevents 'ghost-duplicates' in the cache
      // Ghost duplicates = a term I made to describe the situation where the `id` is internally unique but not globally.
      /*
        By default, Apollo Client uses the `id` or `_id` field to identify objects in the cache.
        But in this example, the GraphQL server has unique label `id` only within each book shelf:

        ** Example **

          bookShelves: [
            {
              id: 1,
              labels: [
                { id: 1, name: 'test1' },
                { id: 2, name: 'test2' },
              ]
            },
            {
              id: 2,
              labels: [
                { id: 1, name: 'apple' },
                { id: 2, name: 'banana' },
              ]
            },
          ]

        If keyFields: ['id'], then cache will only save the `id` 
        thus, it may display as duplicates when rendering in view.

        Try to comment out "keyFields" and see the results in view.
      */
    },
  },
});

// Write initial state for the cache
cache.writeQuery({
  query: FAVORITE_BOOKS_QUERY,
  data: {
    favoriteBooks: [
      {
        __typename: 'Book',
        title: 'My Book',
        id: 123,
        rating: 5,
      },
    ],
  },
});

const resolvers = {
  Mutation: {
    // @ts-expect-error TODO: find its types! The course is not focused on Typescript
    favorite: (_, args, context) => {
      const cache = context.cache;
      const data = cache.readQuery({ query: FAVORITE_BOOKS_QUERY });

      const newData = {
        favoriteBooks: [...data.favoriteBooks, args.book],
      };

      cache.writeQuery({
        query: FAVORITE_BOOKS_QUERY,
        data: newData,
      });

      return newData.favoriteBooks;
    },
  },
};

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
  typeDefs,
  resolvers,
});
