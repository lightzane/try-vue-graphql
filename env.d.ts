/// <reference types="vite/client" />

// This should fix any "Cannot find module" (ts) error when you import .graphql files
declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const value: DocumentNode;
  export default value;
}
