<script setup lang="ts">
import { useGamesStore } from "@/stores/games";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

onMounted(() => {
  const room = localStorage.getItem("room");
  console.log(room);
  const channel = (window as any).Echo.private(room)
    .listen("OpenRoom", async (event: any) => {
      console.log(event);
    })
    .listen("StopOpenGame", async (event: any) => {
      console.log(event);
      if (event.message === "Deleted") {
        localStorage.removeItem("room");
        (window as any).Echo.leave(room);
      }
    });
});
</script>

<template>Hello World</template>
