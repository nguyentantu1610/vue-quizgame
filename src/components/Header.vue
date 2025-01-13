<script setup lang="ts">
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

const { user } = storeToRefs(useAuthStore());
const { logout } = useAuthStore();
const toast = useToast();
// Init data
const isDarkMode = ref<boolean>(false);
const tieredMenu = ref();
const tieredMenuItems = ref([
  {
    label: "Tài khoản",
    icon: "pi pi-cog",
    command: () => router.push({ name: "profile" }),
  },
  {
    label: "Đăng xuất",
    icon: "pi pi-sign-out",
    command: () => logout(),
  },
]);
const showModal = ref<boolean>(false);
const loading = ref<boolean>(false);
const code = ref<string>("");

// Show tiered menu
const toggle = (event: Event) => {
  tieredMenu.value.toggle(event);
};

// Change light/dark mode
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}

// Join room
function handleSubmitForm() {
  if (localStorage.getItem("room")) {
    return toast.add({
      severity: "info",
      summary: "Thông báo",
      detail: "Bạn chỉ có thể vào 1 phòng 1 lúc!",
      life: 3000,
    });
  }
  localStorage.setItem("room", `room.${code.value}`);
  router.push({ name: "room" });
}
</script>

<template>
  <header class="fixed top-0 right-0 left-0 z-50">
    <Toolbar>
      <template #start>
        <a
          :href="`http://localhost:5173/${user?.is_admin ? 'admin' : 'home'}`"
          class="flex items-center justify-center"
        >
          <Avatar image="/menu-icon.png" class="mr-2" size="normal" />
          Quizgame
        </a>
      </template>
      <template #center>
        <div
          class="flex items-center justify-center md:block hidden"
          style="width: 28rem"
        ></div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="isDarkMode" @click="toggleDarkMode">
            <template #handle="{ checked }">
              <i
                :class="[
                  '!text-xs pi',
                  { 'pi-sun': !checked, 'pi-moon': checked },
                ]"
              />
            </template>
          </ToggleSwitch>
          <Button
            label="Play Game"
            icon="pi pi-sparkles"
            icon-pos="left"
            @click="showModal = true"
          />
          <Button
            type="button"
            icon="pi pi-user"
            variant="text"
            :label="user?.name ?? user?.email"
            @click="toggle"
            aria-haspopup="true"
            aria-controls="overlay_tmenu"
            v-if="user?.email"
          />
          <Button
            as="router-link"
            variant="outlined"
            severity="contrast"
            label="Đăng nhập"
            :to="{ name: 'login' }"
            v-else
          />
          <TieredMenu
            ref="tieredMenu"
            id="overlay_tmenu"
            :model="tieredMenuItems"
            popup
          />
        </div>
      </template>
    </Toolbar>
    <Dialog
      v-model:visible="showModal"
      modal
      header="Tham Gia Hoặc Tạo Phòng"
      :style="{ width: '25rem' }"
    >
      <div v-if="!user?.email" class="text-center space-y-3">
        <p>Vui lòng đăng nhập để tiếp tục!</p>
        <Button as="router-link" label="Đăng nhập" :to="{ name: 'login' }" />
      </div>
      <form @submit.prevent="handleSubmitForm" class="flex flex-col" v-else>
        <div class="w-3/4 self-center mt-1 mb-4 space-y-3">
          <FloatLabel variant="on">
            <InputMask
              id="code"
              fluid
              autofocus
              mask="999999"
              v-model="code"
              :disabled="loading"
            />
            <label for="code">Mã phòng</label>
          </FloatLabel>
          <Button
            type="submit"
            label="Tham gia"
            fluid
            :disabled="loading || !code"
            :loading="loading"
          ></Button>
          <Divider><b>OR</b></Divider>
          <Button
            as="router-link"
            variant="outlined"
            severity="contrast"
            label="Tạo phòng"
            fluid
            :disabled="loading"
            :to="{ name: 'profile' }"
          ></Button>
        </div>
      </form>
    </Dialog>
  </header>
</template>
