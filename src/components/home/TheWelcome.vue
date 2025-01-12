<script setup lang="ts">
import { getEchoInstance } from "@/composables/my-echo";
import { useAuthStore } from "@/stores/auth";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

onMounted(() => {
  const route = useRoute();
  const channel = route.query.channel
    ? `google-auth-${route.query.channel}`
    : "";
  if (channel) {
    const { checkUser } = useAuthStore();
    getEchoInstance()
      .channel(channel)
      .listen("GoogleAuthProcessed", async (event: any) => {
        localStorage.setItem("token", event.token);
        await checkUser();
        getEchoInstance().leave(channel);
      });
  }
});
</script>

<template>
  <Button label="Hello World" class="mt-14" />
</template>
