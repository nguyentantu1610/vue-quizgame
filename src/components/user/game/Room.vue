<script setup lang="ts">
import { useGamesStore } from "@/stores/games";
import { storeToRefs } from "pinia";
import { useToast } from "primevue";
import { onMounted } from "vue";

const toast = useToast();
const { joinRoom, destroy } = useGamesStore();
const { players, isListening, relation } = storeToRefs(useGamesStore());
// Init data
const room = localStorage.getItem("room");

onMounted(() => {
  joinRoom();
});
</script>

<template>
  <div class="flex flex-row h-full justify-center">
    <Card class="sm:basis-2/3 m-10 basis-full" v-if="isListening">
      <template #title>
        <Toolbar>
          <template #start>
            <Button
              icon="pi pi-sign-out"
              label="Thoát"
              severity="secondary"
              v-if="relation !== 'creator'"
              @click="destroy('/api/user/games/leave')"
            />
          </template>
          <template #center> Mã Phòng: {{ room?.split(".")[1] }} </template>
          <template #end>
            <Button
              icon="pi pi-trash"
              label="Huỷ Phòng"
              severity="danger"
              v-if="relation === 'creator'"
              @click="destroy('/api/user/games')"
            />
          </template>
        </Toolbar>
      </template>
      <template #content>
        <div class="flex flex-row flex-wrap gap-2" v-if="players">
          <span v-for="(item, index) in players" :key="item.id">
            <Chip
              v-if="item.relation !== 'creator'"
              :label="item.name"
              :removable="relation === 'creator'"
              :pt="{
                removeIcon: {
                  onclick: async () =>
                    await destroy(
                      `/api/user/games/remove-player/${item.id}`
                    ),
                },
              }"
            />
          </span>
        </div>
      </template>
    </Card>
  </div>
</template>
