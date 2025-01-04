<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <Toast
    :pt="{
      root: { class: '!w-80' },
      detail: { class: 'whitespace-nowrap text-ellipsis w-60 overflow-hidden' },
    }"
  />
  <ConfirmPopup></ConfirmPopup>
  <ScrollTop />
  <RouterView />
</template>
