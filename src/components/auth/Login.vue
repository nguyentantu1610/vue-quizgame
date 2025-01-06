<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import type Auth from "@/interfaces/auth";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const { authErrors } = storeToRefs(useAuthStore());
const { auth, $reset } = useAuthStore();
// Init data
const formData = ref<Auth>({ email: "", password: "" });
const loading = ref<boolean>(false);

// Perform login
async function login() {
  loading.value = true;
  const frmDT = new FormData();
  frmDT.append("email", formData.value.email);
  frmDT.append("password", formData.value.password);
  await auth("/api/login", frmDT);
  loading.value = false;
}

onUnmounted(() => $reset());
</script>

<template>
  <Card
    v-focustrap
    class="basis-2/3 xl:basis-1/4 lg:basis-1/3 md:basis-2/5 dark:border dark:border-zinc-50"
  >
    <template #title><h1 class="text-center">Đăng nhập</h1></template>
    <template #content>
      <form @submit.prevent="login" class="w-11/12 ml-5 my-4 space-y-4">
        <div>
          <FloatLabel variant="on">
            <InputText
              type="email"
              id="email"
              fluid
              autofocus
              maxlength="50"
              v-model="formData.email"
              :invalid="!!authErrors?.email"
              :disabled="loading"
            />
            <label for="email">Email</label>
          </FloatLabel>
          <Message
            v-if="authErrors?.email"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ authErrors.email[0] }}
          </Message>
        </div>
        <div>
          <FloatLabel variant="on">
            <Password
              id="password"
              fluid
              toggleMask
              :feedback="false"
              maxlength="50"
              v-model="formData.password"
              :invalid="!!authErrors?.password"
              :disabled="loading"
            />
            <label for="password">Mật khẩu</label>
          </FloatLabel>
          <Message
            v-if="authErrors?.password"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ authErrors.password[0] }}
          </Message>
        </div>
        <div>
          <Button type="submit" label="Đăng nhập" fluid :loading="loading" />
        </div>
        <div class="text-center">
          <RouterLink :to="{ name: 'forgot-password' }">
            Quên mật khẩu?
          </RouterLink>
        </div>
        <Divider><b>OR</b></Divider>
        <div class="flex flex-row justify-center gap-4">
          <Button
            as="a"
            label="Google"
            href="http://localhost:8000/api/auth/google/redirect"
            icon="pi pi-google"
          />
          <Button
            as="router-link"
            label="Đăng ký"
            :to="{ name: 'register' }"
            severity="contrast"
            variant="outlined"
          />
        </div>
      </form>
    </template>
  </Card>
</template>
