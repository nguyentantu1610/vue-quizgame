<script setup lang="ts">
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
    (window as any).Echo.channel(channel).listen(
      "GoogleAuthProcessed",
      async (event: any) => {
        localStorage.setItem("token", event.token);
        await checkUser();
        (window as any).Echo.leaveChannel(channel);
      }
    );
  }
});
</script>

<template>
  <Button label="Hello World" class="mt-14" />
</template>
