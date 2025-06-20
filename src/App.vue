<script setup lang="ts">
import { ALL_BOOKS_QUERY } from '@/graphql';
import { useQuery } from '@vue/apollo-composable';
import { computed, ref, watch } from 'vue';

interface Book {
  id: string;
  title: string;
}

// const books = ref<Book[]>([]);

// ! This will not work since this does not have reactivity inside vue components

// apolloClient
//   .query({
//     query: ALL_BOOKS_QUERY,
//   })
//   .then((res) => {
//     books.value = res.data;
//   });

const searchTerm = ref('');

// IMPORTANT, we must inject DefaultApolloClient (@vue/apollo-composable)
// See: main.ts
// const { loading, result } = useQuery<{ books: Book[] }>(ALL_BOOKS_QUERY, { // NOT REACTIVE
//   // books(title: $title) params
//   title: 'the', // recommended for static searches
// });
const { error, loading, result } = useQuery<{ books: Book[] }>(
  ALL_BOOKS_QUERY,
  () => ({
    // REACTIVE
    // books(title: $title) params
    title: searchTerm.value,
  }),
  () => ({
    debounce: 5000, // send only query (API calls) 500ms after user typing

    // This field seems to be ignoring debounce
    enabled: searchTerm.value.length > 2, // fire only when value is greater than 2
  })
);

// Reference: https://apollo.vuejs.org/guide-composable/query.html#usequery
// watch(result, () => {
//   books.value = result.value?.books ?? [];
// });
const books = computed(() => result.value?.books ?? []);
</script>

<template>
  <main>
    <input type="text" v-model="searchTerm" />
    <h2 v-if="loading">loading...</h2>
    <h3 v-else-if="error">Oops! Something went wrong</h3>
    <p v-else v-for="book of books" :key="book.id">
      {{ book.title }}
    </p>
  </main>
</template>
