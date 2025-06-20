# try-vue-graphql

Learning Apollo Client (https://www.apollographql.com/) with Vue app and Vue Apollo (https://apollo.vuejs.org/).

Related course:

https://www.vuemastery.com/courses/querying-with-graphql/fetching-data-with-queries

## Installed Dependencies

```bash
npm install --save graphql graphql-tag @apollo/client @vue/apollo-composable
```

## Apollo Client Example

### Outside Vue Components

```ts
// (graphql/index.ts)
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
```

```ts
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

apolloClient
  .query({
    query: ALL_BOOKS_QUERY,
  })
  .then((res) => {
    console.log(res);
  });
```

> **IMPORTANT**: For Vue, must import `@apollo/client` like so: `import { ApolloClient } from '@apollo/client/core'`

### Inside Vue Components

Reference: https://apollo.vuejs.org/guide-composable/setup.html#vue-3

We must inject `DefaultApolloClient` from `@vue/apollo-composables`

See [main.ts](./src/main.ts#L14)

See also **useQuery()**: https://apollo.vuejs.org/guide-composable/query.html#usequery

See [App.vue](./src/App.vue#L24)

## How this project is created

`npm create vue`

```bash
npm create vue

> npx
> create-vue

┌  Vue.js - The Progressive JavaScript Framework
│
◇  Project name (target directory):
│  try-vue-graphql
│
◇  Select features to include in your project: (↑/↓ to navigate, space to select, a to toggle all, enter to confirm)
│  TypeScript

Scaffolding project in /Users/lightzane/Documents/dev/try-vue-graphql...
│
└  Done. Now run:

   cd try-vue-graphql
   npm install
   npm run dev

| Optional: Initialize Git in your project directory with:

   git init && git add -A && git commit -m "initial commit"
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
