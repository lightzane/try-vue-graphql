// apollo.config.js
export default {
  client: {
    service: {
      name: 'my-app',
      // URL to the GraphQL API
      url: 'http://localhost:4000/graphql',
    },
    // Files processed by the extension
    includes: [
      // 'src/**/*.vue',
      // 'src/**/*.js',
      // 'src/**/*.ts', // ! merging different files might cause the extension to explode!
      'src/**/*.graphql',
      'src/**/*.gql',
    ],
    excludes: [
      'src/graphql/local/**'
    ]
  },
};
