<script setup lang="ts">
import EditRating from '@/components/EditRating.vue';
import ALL_BOOKS_QUERY from './graphql/GetAllBooks.query.graphql';
import { useQuery } from '@vue/apollo-composable';
import { computed, ref, watch } from 'vue';
import AddBook from '@/components/AddBook.vue';
import type { Book } from '@/types';

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
const activeBook = ref<Book | null>(null);
const showNewBookForm = ref(false);

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
    debounce: 500, // send only query (API calls) 500ms after user typing

    // This field seems to be ignoring debounce
    // enabled: searchTerm.value.length > 2, // fire only when value is greater than 2
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
    <section>
      <button v-if="!showNewBookForm" @click="showNewBookForm = true">
        Add a new book
      </button>
      <AddBook
        v-else
        :title="searchTerm"
        @close-form="showNewBookForm = false"
      />
    </section>
    <input type="text" v-model="searchTerm" />
    <h2 v-if="loading">loading...</h2>
    <template v-else-if="error">
      <h3>Oops! Something went wrong</h3>
      <pre>{{ JSON.stringify(error, null, 2) }}</pre>
    </template>
    <template v-else>
      <p v-if="activeBook">
        Update "{{ activeBook.title }}" rating:
        <EditRating
          :initial-rating="activeBook.rating"
          :book-id="activeBook.id"
          @close-form="activeBook = null"
        />
      </p>
      <template v-else>
        <p v-for="book of books" :key="book.id">
          {{ book.title }} - {{ book.rating }}
          <button @click="activeBook = book">Edit Rating</button>
        </p>
      </template>
    </template>
  </main>
</template>
