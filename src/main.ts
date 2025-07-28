import './assets/main.css';

import { createApp, h, provide } from 'vue';
import App from './App.vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { apolloClient } from '@/apollo';

// createApp(App).mount('#app');

// Reference: https://apollo.vuejs.org/guide-composable/setup.html#vue-3
const app = createApp({
  setup: () => {
    // * We must inject DefaultApolloClient
    // * in order to make Apollo Client / graphql query calls
    // * within Vue components
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

app.mount('#app');
