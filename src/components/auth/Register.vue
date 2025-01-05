<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import type Auth from "@/interfaces/auth";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const { authErrors } = storeToRefs(useAuthStore());
const { auth, $reset } = useAuthStore();
// Init data
const formData = ref<Auth>({
  email: "",
  verification_code: "",
  password: "",
  password_confirmation: "",
});
const btnLabel = ref<string>("Gửi mã");
const loading = ref<boolean>(false);
const btnLoading = ref<boolean>(false);

// Perform register
async function register() {
  loading.value = true;
  const frmDT = new FormData();
  frmDT.append("email", formData.value.email);
  frmDT.append("verification_code", formData.value.verification_code as string);
  frmDT.append("password", formData.value.password);
  frmDT.append(
    "password_confirmation",
    formData.value.password_confirmation as string
  );
  await auth("/api/register", frmDT);
  loading.value = false;
}

// Handle send verification code
async function sendVerificationCode() {
  let time: number = 0;
  btnLoading.value = true;
  btnLabel.value = "Gửi lại 5s";
  let countDown = setInterval(() => {
    btnLabel.value = `Gửi lại ${4 - time++}s`;
    if (time === 5) {
      btnLoading.value = false;
      btnLabel.value = "Gửi mã";
      clearInterval(countDown);
    }
  }, 1000);
  const frmDT = new FormData();
  frmDT.append("email", formData.value.email);
  await auth("/api/send-register-code", frmDT);
}

onUnmounted(() => $reset());
</script>

<template>
  <Card
    v-focustrap
    class="basis-2/3 xl:basis-1/4 lg:basis-1/3 md:basis-2/5 dark:border dark:border-zinc-50"
  >
    <template #title><h1 class="text-center">Đăng ký</h1></template>
    <template #content>
      <form @submit.prevent="register" class="w-11/12 ml-5 my-4 space-y-4">
        <div>
          <FloatLabel variant="on">
            <InputGroup>
              <InputText
                type="email"
                id="email"
                autofocus
                maxlength="50"
                v-model="formData.email"
                :invalid="!!authErrors?.email"
                :disabled="loading"
              />
              <label for="email">Email</label>
              <InputGroupAddon>
                <Button
                  type="button"
                  :label="btnLabel"
                  :loading="btnLoading"
                  @click="sendVerificationCode"
                />
              </InputGroupAddon>
            </InputGroup>
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
            <InputMask
              id="verification-code"
              fluid
              mask="******"
              v-model="formData.verification_code"
              :invalid="!!authErrors?.verification_code"
              :disabled="loading"
            />
            <label for="verification-code">Mã xác minh</label>
          </FloatLabel>
          <Message
            v-if="authErrors?.verification_code"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ authErrors.verification_code[0] }}
          </Message>
        </div>
        <div>
          <FloatLabel variant="on">
            <Password
              id="password"
              fluid
              toggleMask
              maxlength="50"
              promptLabel="Vui lòng điền mật khẩu"
              weakLabel="Yếu"
              mediumLabel="Trung bình"
              strongLabel="Mạnh"
              v-model="formData.password"
              :invalid="!!authErrors?.password"
              :disabled="loading"
            >
              <template #footer>
                <Divider />
                <ul class="pl-2 ml-2 my-0 leading-normal">
                  <li>Ít nhất 1 ký tự thường</li>
                  <li>Ít nhất 1 ký tự hoa</li>
                  <li>Ít nhất 1 chữ số</li>
                  <li>Tối thiểu 8 ký tự</li>
                </ul>
              </template>
            </Password>
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
          <FloatLabel variant="on">
            <Password
              id="confirmation-password"
              fluid
              toggleMask
              maxlength="50"
              promptLabel="Vui lòng điền lại mật khẩu"
              weakLabel="Yếu"
              mediumLabel="Trung bình"
              strongLabel="Mạnh"
              :invalid="!!authErrors?.password_confirmation"
              v-model="formData.password_confirmation"
              :disabled="loading"
            >
              <template #footer>
                <Divider />
                <ul class="pl-2 ml-2 my-0 leading-normal">
                  <li>Ít nhất 1 ký tự thường</li>
                  <li>Ít nhất 1 ký tự hoa</li>
                  <li>Ít nhất 1 chữ số</li>
                  <li>Tối thiểu 8 ký tự</li>
                </ul>
              </template>
            </Password>
            <label for="confirmation-password">Nhập lại mật khẩu</label>
          </FloatLabel>
        </div>
        <div>
          <Button type="submit" label="Đăng ký" fluid :loading="loading" />
        </div>
        <Divider><b>OR</b></Divider>
        <div class="text-center">
          <span class="dark:text-zinc-500">Đã có tài khoản?</span>
          <RouterLink
            :to="{ name: 'login' }"
            class="text-zinc-950 dark:text-zinc-50 font-medium"
          >
            Đăng nhập
          </RouterLink>
        </div>
      </form>
    </template>
  </Card>
</template>
