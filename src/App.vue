<script setup lang="ts">
import { ALL_BOOKS_QUERY } from '@/graphql';
import { useQuery } from '@vue/apollo-composable';
import { ref, watch } from 'vue';

interface Book {
  id: string;
  title: string;
}

const books = ref<Book[]>([]);

// ! This will not work since this does not have reactivity inside vue components

// apolloClient
//   .query({
//     query: ALL_BOOKS_QUERY,
//   })
//   .then((res) => {
//     books.value = res.data;
//   });

// IMPORTANT, we must inject DefaultApolloClient (@vue/apollo-composable)
// See: main.ts
const { loading, result } = useQuery<{ books: Book[] }>(ALL_BOOKS_QUERY);

// Reference: https://apollo.vuejs.org/guide-composable/query.html#usequery
watch(result, () => {
  books.value = result.value?.books ?? [];
});
</script>

<template>
  <main>
    <h2 v-if="loading">loading...</h2>

    <p v-for="book of books" :key="book.id">
      {{ book.title }}
    </p>
  </main>
</template>
