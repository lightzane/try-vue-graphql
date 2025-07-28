<script setup lang="ts">
import EditRating from '@/components/EditRating.vue';
import ALL_BOOKS_QUERY from './graphql/GetAllBooks.query.graphql';
import BOOK_SUBSCRIPTION from './graphql/NewBook.subscription.graphql';
import FAVORITE_BOOKS_QUERY from './graphql/local/FavoriteBooks.query.graphql';
import FAVORITE_MUTATION from './graphql/local/Favorite.mutation.graphql';
import GET_BOOKSHELVES_QUERY from './graphql/BookShelves.query.graphql';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { computed, ref, watch } from 'vue';
import AddBook from '@/components/AddBook.vue';
import type { Book } from '@/types';

/** The type of 'data' that will be returned as a response from the GraphQL Server */
type QueryResults = {
  books?: Book[];
  bookSub?: Book;
};

type BookShelvesQueryResult = {
  bookShelves: {
    id: number;
    category: string;
    labels: { id: number; name: string }[];
  }[];
};

const searchTerm = ref('');
const activeBook = ref<Book | null>(null);
const showNewBookForm = ref(false);

// IMPORTANT, we must inject DefaultApolloClient (@vue/apollo-composable)
// See: main.ts
// const { loading, result } = useQuery<{ books: Book[] }>(ALL_BOOKS_QUERY, { // NOT REACTIVE
//   // books(title: $title) params
//   title: 'the', // recommended for static searches
// });
const { error, loading, result, subscribeToMore } = useQuery<QueryResults>(
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

// ! [REQUIRES] Setup `http` and `ws` (see src/apollo/index.ts)
subscribeToMore({
  document: BOOK_SUBSCRIPTION,
  updateQuery: (prev, newResult) => {
    // Note: The GraphQL Server pushes the "bookSub" subscription whenever the book is added or updated
    // console.log({ prev, newResult }); // observe the obj's structure / shape

    const books = [...(prev.books ?? [])];
    const bookSubResult = newResult.subscriptionData.data.bookSub as Book;

    let isNew = true;

    // Prevent duplicate since the GraphQL server pushes subscription on "bookSub" whenever a book is added or updated
    books.forEach((book, index) => {
      if (book.id === bookSubResult.id) {
        isNew = false;
        books[index] = bookSubResult;
      }
    });

    // [NOTE] If you are already using cache.writeQuery(), duplication may happen
    if (isNew) {
      books.push(bookSubResult);
    }

    // Returns based on the typeof useQuery() which is QueryResults
    return { books };
  },
});

// Reference: https://apollo.vuejs.org/guide-composable/query.html#usequery
// watch(result, () => {
//   books.value = result.value?.books ?? [];
// });
const books = computed(() => result.value?.books ?? []);

const { result: favResult } = useQuery<{ favoriteBooks: Book[] }>(
  FAVORITE_BOOKS_QUERY
);

const favoriteBooks = computed(() => favResult.value?.favoriteBooks ?? []);

const { mutate: addFavorite } = useMutation(FAVORITE_MUTATION);

const { result: bookShelvesResult } = useQuery<BookShelvesQueryResult>(
  GET_BOOKSHELVES_QUERY
);

const bookShelves = computed(() => bookShelvesResult.value?.bookShelves ?? []);
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
        <div class="list-wrapper">
          <!-- All Books -->
          <div class="list">
            <h3>All Books</h3>
            <p v-for="book of books" :key="book.id">
              {{ book.title }} - {{ book.rating }}
              <button @click="activeBook = book">Edit Rating</button>
              <button @click="addFavorite({ book })">Favorite</button>
            </p>
          </div>

          <!-- Favorite Books -->
          <div class="list">
            <h3>Favorite Books</h3>
            <p v-for="book of favoriteBooks" :key="book.id">
              {{ book.title }} - {{ book.rating }}
              <button @click="activeBook = book">Edit Rating</button>
            </p>
          </div>

          <!-- Book Shelves -->
          <div class="list">
            <h3>Book Shelves</h3>
            <p>Demo <code>InMemoryCache</code> to prevent displaying duplicate data from cache</p>
            <p v-for="shelf of bookShelves" :key="shelf.id">
              {{ shelf.category }}
              <ol>
                <li
                v-for="label of shelf.labels"
                :key="`${label.id}-${label.name}`"
              >
                {{ label.name }}
              </li>
              </ol>
            </p>
          </div>
        </div>
      </template>
    </template>
  </main>
</template>

<style scoped>
.list-wrapper {
  display: flex;
  margin: 0 auto;
  max-width: 960px;
}

.list {
  width: 50%;
}
</style>
