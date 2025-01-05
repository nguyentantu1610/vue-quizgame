<script setup lang="ts">
import Header from "../components/Header.vue";
</script>

<template>
  <Header />
  <main class="mt-14 bg-slate-50 dark:bg-zinc-950">
    <RouterView />
    <ScrollTop />
  </main>
</template>
