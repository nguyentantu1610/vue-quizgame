<script setup lang="ts">
import Header from "../components/Header.vue";
import SideBar from "@/components/admin/SideBar.vue";
</script>

<template>
  <Header />
  <main class="mt-14">
    <div class="flex flex-row bg-slate-50 dark:bg-zinc-950" style="height: 83vh">
      <SideBar />
      <RouterView />
    </div>
  </main>
</template>
