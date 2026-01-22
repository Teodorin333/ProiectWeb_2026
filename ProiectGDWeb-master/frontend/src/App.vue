<template>
  <v-app>
    <v-main>
      <navigation />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import Navigation from "./components/Navigation.vue";

export default {
  name: "App",
  components: {
    Navigation
  },
  data: () => ({
    //
  })
};
</script>
