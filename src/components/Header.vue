<script setup lang="ts">
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { RouterLink } from "vue-router";

const { user } = storeToRefs(useAuthStore());
const { logout } = useAuthStore();
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

// Show tiered menu
const toggle = (event: Event) => {
  tieredMenu.value.toggle(event);
};

// Change light/dark mode
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}
</script>

<template>
  <header class="fixed top-0 right-0 left-0 z-50">
    <Toolbar>
      <template #start>
        <a
          :href="`http://quizgame.test/${user?.is_admin ? 'admin' : 'home'}`"
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
        <div class="flex items-center gap-6">
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
            :to="{ name: 'home' }"
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
  </header>
</template>
