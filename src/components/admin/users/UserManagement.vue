<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type User from "@/interfaces/user";
import { storeToRefs } from "pinia";
import { useConfirm } from "primevue/useconfirm";
import { useUsersStore } from "@/stores/users";

const { getUsers, deleteUser, exportData, restoreUser } = useUsersStore();
const { results } = storeToRefs(useUsersStore());
const confirm = useConfirm();
// Init data
const users = ref<Array<User> | null>(new Array<User>(2));
const columns = ref([
  { field: "name", header: "Tên người dùng" },
  { field: "email_verified_at", header: "Ngày tham gia" },
  { field: "deleted_at", header: "Tình trạng" },
]);
const selectedColumns = ref(columns.value);
const sortType = ref<string>("desc");
const sortBtnIcon = ref("pi pi-sort-amount-down");
const searchQuery = ref<string>("");
const totalPages = ref<number>(0);
const page = ref<number>(0);

// Show/hide column
const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter((col) => val.includes(col));
};

// Change sort icon and type
function changeSort() {
  if (sortBtnIcon.value === "pi pi-sort-amount-up-alt") {
    sortBtnIcon.value = "pi pi-sort-amount-down";
    sortType.value = "desc";
  } else {
    sortBtnIcon.value = "pi pi-sort-amount-up-alt";
    sortType.value = "asc";
  }
}

// Get data from server
async function getData() {
  users.value = new Array<User>(2);
  totalPages.value = 0;
  await getUsers(
    `/api/admin/users?sort_type=${sortType.value}&page=${
      page.value / 2 + 1
    }&search_query=${searchQuery.value}`
  );
  setTimeout(() => {
    if (results.value) {
      users.value = results.value.data;
      totalPages.value = results.value.total;
    } else if (page.value !== 0) {
      page.value = 0;
    } else {
      users.value = null;
    }
  }, 1000);
}

// Watch sort type/search query and page change
const watcher = watchEffect(async () => await getData());

// Delete/retore user
const deleteOrRestoreUser = (data: User, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: data.deleted_at
      ? "Bạn có chắc là muốn khôi phục tài khoản này?"
      : "Bạn có chắc là muốn ngừng kích hoạt tài khoản này?",
    icon: "pi pi-info-circle",
    rejectProps: {
      label: "Huỷ",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: data.deleted_at ? "Khôi phục" : "Ngừng kích hoạt",
      severity: data.deleted_at ? "" : "danger",
    },
    accept: async () => {
      data.deleted_at
        ? await restoreUser(`/api/admin/users/restore/${data.id}`)
        : await deleteUser(`/api/admin/users/${data.id}`);
      await getData();
    },
    reject: () => console.log(`xoá ${data.name} thất bại~`),
  });
};
</script>

<template>
  <div class="pt-6 pl-10 pr-10 overflow-auto basis-4/5">
    <h1 class="text-3xl font-medium mb-6">Danh Sách Người Dùng</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button
          label="Xuất file"
          icon="pi pi-upload"
          severity="secondary"
          @click="exportData"
        />
      </template>
    </Toolbar>
    <DataTable
      :value="users"
      scrollable
      scrollHeight="400px"
      showGridlines
      resizableColumns
      columnResizeMode="expand"
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <div style="text-align: left">
            <MultiSelect
              :modelValue="selectedColumns"
              :options="columns"
              optionLabel="header"
              @update:modelValue="onToggle"
              display="chip"
              placeholder="Chọn cột"
              class="max-w-96"
            />
          </div>
          <div class="flex justify-end gap-2 grow">
            <Button
              :icon="sortBtnIcon"
              label="Email"
              iconPos="right"
              variant="text"
              @click="changeSort"
            />
            <IconField>
              <InputIcon><i class="pi pi-search" /></InputIcon>
              <InputText placeholder="Tìm kiếm" v-model="searchQuery" />
            </IconField>
            <Button icon="pi pi-refresh" rounded raised @click="getData" />
          </div>
        </div>
      </template>
      <Column field="email" header="Email">
        <template #body="{ data }">
          <Skeleton v-if="!data"></Skeleton>
          <p v-else class="max-w-52">{{ data.email }}</p>
        </template>
      </Column>
      <Column
        v-for="(col, index) of selectedColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field + '_' + index"
      >
        <template #body="{ data }">
          <Skeleton v-if="!data"></Skeleton>
          <div v-else>
            <Tag
              v-if="col.field === 'deleted_at'"
              :value="!data[col.field] ? 'Kích hoạt' : 'Vô hiệu'"
              :severity="!data[col.field] ? 'success' : ''"
            />
            <p v-else class="max-w-52">{{ data[col.field] }}</p>
          </div>
        </template>
      </Column>
      <Column class="w-24 space-x-2">
        <template #body="{ data }">
          <Button
            v-if="data"
            :icon="data.deleted_at ? 'pi pi-undo' : 'pi pi-trash'"
            :severity="data.deleted_at ? 'secondary' : 'danger'"
            rounded
            @click="deleteOrRestoreUser(data, $event)"
          ></Button>
          <Skeleton v-else shape="circle" size="3rem"></Skeleton>
        </template>
      </Column>
      <template #footer>
        <Paginator
          v-model:first="page"
          :rows="2"
          :totalRecords="totalPages"
          class="h-12"
        ></Paginator>
      </template>
      <template #empty> Không tìm thấy người dùng trong CSDL. </template>
    </DataTable>
  </div>
</template>
