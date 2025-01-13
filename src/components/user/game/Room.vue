<script setup lang="ts">
import { useGamesStore } from "@/stores/games";
import { storeToRefs } from "pinia";
import { useToast } from "primevue";
import { onMounted } from "vue";

const toast = useToast();
const { joinRoom, destroy } = useGamesStore();
const {
  players,
  isListening,
  relation,
  loading,
  roomStatus,
  quiz,
  leaderboard,
  score,
  time,
  answered,
} = storeToRefs(useGamesStore());
// Init data
const room = localStorage.getItem("room");

// Join room
onMounted(() => {
  joinRoom();
});

// Get button color
function getColor(index: number) {
  let color: string = "contrast";
  switch (index) {
    case 0:
      color = "danger";
      break;
    case 1:
      color = "info";
      break;
    case 2:
      color = "success";
      break;
    case 3:
      color = "warn";
      break;
    default:
      color = "contrast";
      break;
  }
  return color;
}

let countDown = setInterval(() => {
  time.value--;
  if (time.value === 0) {
    clearInterval(countDown);
  }
}, 1000);
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
              :loading="loading"
              @click="destroy('/api/user/games/leave')"
            />
          </template>
          <template #center> Phòng: {{ room?.split(".")[1] }} </template>
          <template #end>
            <Button
              icon="pi pi-trash"
              label="Huỷ Phòng"
              severity="danger"
              v-if="relation === 'creator'"
              :loading="loading"
              @click="destroy('/api/user/games')"
            />
          </template>
        </Toolbar>
      </template>
      <template #content>
        <div v-if="players && roomStatus === 'waiting'">
          <div class="w-full text-center mt-10 mb-6">
            <Button
              raised
              variant="text"
              severity="secondary"
              label="Bắt Đầu"
              :loading="loading"
            />
          </div>
          <div class="flex flex-row flex-wrap gap-2">
            <span v-for="(item, index) in players" :key="item.id">
              <Chip
                v-if="item.relation !== 'creator'"
                :label="item.name"
                :removable="relation === 'creator'"
                :pt="{
                  removeIcon: {
                    onclick: async () =>
                      await destroy(`/api/user/games/remove-player/${item.id}`),
                  },
                }"
              />
            </span>
          </div>
        </div>
        <div v-if="roomStatus === 'playing'">
          <p class="text-4xl font-bold text-center mt-10 mb-16">
            {{ quiz.question }}
          </p>
          <p class="flex flex-row mb-12">
            <span class="basis-1/2 pl-10">
              <span class="text-xl font-bold">{{ answered }}</span> 
              <span class="text-xs"> Trả lời</span>
            </span>
            <span class="basis-1/2 text-right pr-10">
              <span class=" text-xl font-bold">{{ time }}</span> 
              <span class="text-xs"> s</span>
            </span>
          </p>
          <div class="flex sm:flex-row flex-col flex-wrap sm:pl-24">
            <Button
              v-for="(item, index) in quiz.answer.split(',')"
              :loading="loading"
              :severity="getColor(index)"
              :label="item"
              :disabled="relation === 'creator'"
              class="basis-5/12 m-2 whitespace-nowrap text-ellipsis overflow-hidden h-14"
            />
          </div>
        </div>
        <div class="text-center" v-if="roomStatus === 'pending'">
          <p class="text-xl font-bold m-10">Gửi Thành Công</p>
          <p class="text-lg mb-4">
            Điểm: <span class="text-lg font-bold ml-2">{{ score }}</span>
          </p>
          <p>(Chưa tính câu hiện tại)</p>
        </div>
        <div v-if="roomStatus === 'finished'">
          <p class="text-2xl font-bold m-4 text-center">BXH</p>
          <ul
            v-for="(item, index) in leaderboard"
            class="list-none text-xl font-bold border rounded-md"
          >
            <li
              class="flex justify-between p-4 dark:hover:bg-zinc-800 hover:bg-slate-100 rounded-md cursor-pointer"
            >
              <span>{{ index + 1 }}</span>
              <span>{{ item.name ?? item.email }}</span>
              <span>{{ item.score }}</span>
            </li>
          </ul>
        </div>
      </template>
    </Card>
  </div>
</template>
