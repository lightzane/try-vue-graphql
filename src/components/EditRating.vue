<script setup lang="ts">
import UPDATE_RATING_MUTATION from '@/graphql/UpdateRating.mutation.graphql';
import { useMutation } from '@vue/apollo-composable';
import { ref } from 'vue';

interface Props {
  initialRating: number | null;
  bookId: string;
}

const emit = defineEmits(['closeForm']);
const props = defineProps<Props>();

const rating = ref(props.initialRating ?? 0);

const { mutate, loading, onDone } = useMutation(UPDATE_RATING_MUTATION, () => ({
  variables: {
    id: props.bookId,
    rating: parseFloat(rating.value.toString()),
  },
}));

onDone(() => {
  emit('closeForm');
});
</script>

<template>
  <input
    type="text"
    v-model="rating"
    @keyup.enter="mutate"
    @keyup.esc="$emit('closeForm')"
  />
  <button @click="$emit('closeForm')">Cancel</button>
  <p v-if="loading">Updating...</p>
</template>
