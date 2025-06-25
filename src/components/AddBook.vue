<script setup lang="ts">
import { useMutation } from '@vue/apollo-composable';
import { reactive } from 'vue';

import ADD_BOOK_MUTATION from '@/graphql/AddBook.mutation.graphql';
import ALL_BOOKS_QUERY from '@/graphql/GetAllBooks.query.graphql';
import type { Book } from '@/types';

interface Props {
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['closeForm']);

const newBook = reactive({
  title: '',
  author: '',
  year: '',
  rating: '',
  description: '',
});

const { mutate, onDone } = useMutation(ADD_BOOK_MUTATION, () => ({
  variables: {
    input: {
      ...newBook,
      rating: newBook.rating || 0,
    },
  },
  // A function used to update the Apollo Client cache after the mutation completes.
  update: (cache, result) => {
    /* 
      @param `result` = response from the server

      After pressing SUBMIT, the data will be added in the background/backend.
      HOWEVER, it will not be displayed since Apollo GraphQL uses cache.
      And it's a NEW ID, and there is nothing to update in the existing cache.

      We have to work with the cache MANUALLY, to update the data.
        1. readQuery()
        2. modify data immutable way (to create new entity rather than modifying the cache)
        3. writeQuery()
    */

    interface MyCacheQuery {
      books: Book[];
    }

    // 1️⃣ readQuery()
    const source = cache.readQuery<MyCacheQuery>({
      query: ALL_BOOKS_QUERY,
      // console.log(source);
      // --> The console.log(source) may be NULL
      // Why? It is possible that the ALL_BOOKS_QUERY in the cache
      // is using different fields or variables (e.g. title)
      // So we need to match the query that is existing in the cache
      variables: { title: props.title },
    });

    if (!source) {
      return;
    }

    // 2️⃣ modify data immutable way
    const data = {
      // We should not be pushing directly to "books" to respect the cache's "immutability"
      books: [...source.books, result.data.addBook],
      // Important Note:
      // The `books` and `addBook` should be the EXACT declaration from the GraphQL Schema Query
    };

    // 3️⃣ writeQuery()
    // ! This became a duplicate since after Subscription of "bookSub" is implmented
    // ! Since the server pushes real-time updates whenever a new book is added
    // cache.writeQuery({
    //   data,
    //   query: ALL_BOOKS_QUERY, // the query we want to modify
    //   variables: { title: props.title },
    // });
  },

  // Sometimes we want to show the result of the mutation in the page
  // even before this mutation is resolved
  // For example, when we reorder items in the list with drag and drop,
  // it might not be the best user experience to show the loader every single time
  // after the reordering.
  // We tell Apollo to show the mutation result
  // before we retrieved this result like so:
  optimisticResponse: {
    // should EXACTLY match the result or API response
    addBook: {
      __typename: 'Book', // GraphQL Type in our schema
      id: -1, // Don't know the id so put negative one as a placeholder
      ...newBook,
    },
  },
  // In our case of adding a new book to the list, this task is rather trivial.
  // We know the book data — we already entered this data in the form.
  // We only lack the unique ID of the book (because it’s generated on our server)
  // but we can show the rest of the data.
  // This can be tested via throttling the network to lower network speeds in browser console
}));

onDone(() => {
  emit('closeForm');
});
</script>

<template>
  <form @submit.prevent="mutate()">
    <label for="title">
      Title
      <input v-model.trim="newBook.title" type="text" id="title" required />
    </label>
    <label for="author">
      Author
      <input v-model.trim="newBook.author" type="text" id="author" required />
    </label>
    <label for="description">
      Description (optional)
      <input v-model.trim="newBook.description" type="text" id="description" />
    </label>
    <label for="year">
      Year
      <input v-model.number="newBook.year" type="number" id="year" required />
    </label>
    <label for="rating">
      Rating (optional)
      <input v-model.number="newBook.rating" type="number" id="rating" />
    </label>
    <button type="submit">Submit</button>
    <button type="reset" @click="$emit('closeForm')">Close form</button>
  </form>
</template>

<style scoped>
label {
  display: block;
}
</style>
