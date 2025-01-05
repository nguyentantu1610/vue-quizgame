<script setup lang="ts">
import { useUsersStore } from "@/stores/users";
import { storeToRefs } from "pinia";
import type User from "@/interfaces/user";
import { onMounted, readonly, ref } from "vue";

const { getUsers, $reset, updateUser } = useUsersStore();
const { userErrors } = storeToRefs(useUsersStore());
// Init data
const formData = ref<User>({
  id: "",
  is_admin: false,
  name: "",
  email: "",
  email_verified_at: "",
  password_reseted_at: "",
  deleted_at: "",
});
const loading = ref<boolean>(false);

// Get user information from server
onMounted(async () => {
  $reset();
  const { results } = storeToRefs(useUsersStore());
  await getUsers("/api/user/show");
  results.value ? (formData.value = results.value) : "";
});

// Handle update user
async function handleSubmitForm() {
  loading.value = true;
  const frmDT = new FormData();
  frmDT.append("name", formData.value.name);
  await updateUser("/api/user/update?_method=PATCH", frmDT);
  loading.value = false;
}
</script>

<template>
  <div class="flex flex-row">
    <div class="mt-8 basis-1/3 pl-10">
      <Card>
        <template #title>Thông Tin Người Dùng</template>
        <template #content>
          <form
            v-focustrap
            @submit.prevent="handleSubmitForm"
            class="flex flex-col mt-3 gap-6 items-center"
          >
            <Message v-if="formData.password_reseted_at">
              Mật khẩu thay đổi lần cuối lúc
              {{ formData.password_reseted_at }}
            </Message>
            <div class="w-2/3">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="email"
                  fluid
                  maxlength="50"
                  readonly
                  v-model="formData.email"
                />
                <label for="email">Email</label>
              </FloatLabel>
              <Message size="small" severity="secondary" variant="simple">
                Đã xác minh lúc {{ formData.email_verified_at }}
              </Message>
            </div>
            <div class="w-2/3">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="name"
                  fluid
                  maxlength="50"
                  v-model="formData.name"
                  :invalid="!!userErrors?.name"
                  :disabled="loading"
                />
                <label for="name">Tên người dùng</label>
              </FloatLabel>
              <Message
                v-if="userErrors?.name"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ userErrors.name[0] }}
              </Message>
            </div>
            <div class="w-32">
              <Button
                type="submit"
                label="Cập nhật"
                :disabled="!formData.name || loading"
                :loading="loading"
              ></Button>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>
