<script setup lang="ts">
import { useConfirm } from "primevue";
import { useQuestionnairesStore } from "@/stores/questionnaires";
import { storeToRefs } from "pinia";
import { ref, watchEffect } from "vue";
import type Questionnaire from "@/interfaces/questionnaire";
import router from "@/router";

const {
  getQuestionnaires,
  createOrUpdateQuestionnaire,
  $reset,
  deleteQuestionnaire,
} = useQuestionnairesStore();
const { results, questionnaireErrors } = storeToRefs(useQuestionnairesStore());
const confirm = useConfirm();
// Init data
const showModal = ref<boolean>(false);
const loading = ref<boolean>(false);
const questionnaires = ref<Array<Questionnaire> | null>(
  new Array<Questionnaire>(2)
);
const columns = ref([
  { field: "description", header: "Mô tả" },
  { field: "created_at", header: "Ngày tạo" },
  { field: "updated_at", header: "Ngày cập nhật" },
]);
const selectedColumns = ref(columns.value);
const sortType = ref<string>("desc");
const sortBtnIcon = ref("pi pi-sort-amount-down");
const searchQuery = ref<string>("");
const totalPages = ref<number>(0);
const page = ref<number>(0);
const formData = ref<Questionnaire>({ id: "", name: "", description: "" });

// Show/hide columns
const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter((col) => val.includes(col));
};

// Change sort type/icon
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
  questionnaires.value = new Array<Questionnaire>(2);
  totalPages.value = 0;
  await getQuestionnaires(
    `/api/user/questionnaires?sort_type=${sortType.value}&page=${
      page.value / 2 + 1
    }&search_query=${searchQuery.value}`
  );
  setTimeout(() => {
    if (results.value) {
      questionnaires.value = results.value.data;
      totalPages.value = results.value.total;
    } else if (page.value != 0) {
      page.value = 0;
    } else {
      questionnaires.value = null;
    }
  }, 1000);
}

// Watch sort type/page and search query change
const watcher = watchEffect(async () => await getData());

// Show dialog for create/update questionnaire
function showDialog() {
  $reset();
  showModal.value = true;
}

// Get data from choosen row
const selectRow = (data: Questionnaire) => {
  formData.value = data;
  showDialog();
};

// Handle create/update questionnaire
async function handleSubmitForm() {
  loading.value = true;
  const frmDT = new FormData();
  frmDT.append("name", formData.value.name);
  frmDT.append("description", formData.value.description);
  await createOrUpdateQuestionnaire(
    formData.value.id
      ? `/api/user/questionnaires/${formData.value.id}?_method=PATCH`
      : "/api/user/questionnaires",
    frmDT
  );
  loading.value = false;
  if (
    !questionnaireErrors.value?.name &&
    !questionnaireErrors.value?.description
  ) {
    showModal.value = false;
    formData.value = { id: "", name: "", description: "" };
    await getData();
  }
}

// Handle delete questionnaire
const destroyQuestionnaire = (data: Questionnaire, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: "Bạn có chắc là muốn xoá bảng câu đố này?",
    icon: "pi pi-info-circle",
    rejectProps: {
      label: "Huỷ",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Xoá",
      severity: "danger",
    },
    accept: async () => {
      await deleteQuestionnaire(`/api/user/questionnaires/${data.id}`);
      await getData();
    },
    reject: () => console.log(`xoá ${data.name} thất bại~`),
  });
};

// Redirect to questionnaire detail
const onRowSelect = (event: any) =>
  router.push({ name: "questionnaire-detail", params: { id: event.data.id } });
</script>

<template>
  <Card>
    <template #title>Danh Sách Bảng Câu Đố</template>
    <template #content>
      <Toolbar class="mb-6">
        <template #start>
          <Button
            label="Thêm mới"
            icon="pi pi-plus"
            class="mr-2"
            @click="showDialog()"
          />
        </template>
        <template #end>
          <i
            class="pi pi-question-circle"
            style="font-size: 1.5rem; color: #708090"
            v-tooltip.left="
              '1. Nhấn \'Thêm mới\' để tạo game.\n 2. Thêm 1 vài quiz.\n 3. Nhấn \'Tạo phòng\' để chơi~.'
            "
          ></i>
        </template>
      </Toolbar>
      <Dialog
        v-model:visible="showModal"
        modal
        :header="(formData.id ? 'Cập nhật' : 'Thêm mới') + 'bảng câu đố'"
        :style="{ width: '25rem' }"
      >
        <form @submit.prevent="handleSubmitForm" class="flex flex-col">
          <div class="w-3/4 self-center mt-1 mb-4">
            <FloatLabel variant="on">
              <InputText
                type="text"
                id="name"
                fluid
                autofocus
                maxlength="50"
                v-model="formData.name"
                :invalid="!!questionnaireErrors?.name"
                :disabled="loading"
              />
              <label for="name">Tên</label>
            </FloatLabel>
            <Message
              v-if="questionnaireErrors?.name"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ questionnaireErrors.name[0] }}
            </Message>
          </div>
          <div class="self-center mb-6 w-3/4">
            <FloatLabel variant="on">
              <InputText
                type="text"
                id="description"
                fluid
                maxlength="50"
                v-model="formData.description"
                :invalid="!!questionnaireErrors?.description"
                :disabled="loading"
              />
              <label for="description">Mô tả</label>
            </FloatLabel>
            <Message
              v-if="questionnaireErrors?.description"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ questionnaireErrors.description[0] }}
            </Message>
          </div>
          <div class="flex justify-end gap-2">
            <Button
              type="button"
              label="Huỷ"
              severity="secondary"
              @click="showModal = false"
            ></Button>
            <Button type="submit" label="Lưu" :loading="loading"></Button>
          </div>
        </form>
      </Dialog>
      <DataTable
        :value="questionnaires"
        scrollable
        scrollHeight="400px"
        showGridlines
        resizableColumns
        columnResizeMode="expand"
        tableStyle="min-width: 50rem"
        selectionMode="single"
        :metaKeySelection="true"
        @rowSelect="onRowSelect"
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
                label="Tên"
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
        <Column field="name" header="Tên">
          <template #body="{ data }">
            <Skeleton v-if="!data"></Skeleton>
            <p v-else class="max-w-52">{{ data.name }}</p>
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
              <p class="max-w-52">{{ data[col.field] }}</p>
            </div>
          </template>
        </Column>
        <Column class="w-24 space-x-2">
          <template #body="{ data }">
            <Button
              v-if="data"
              icon="pi pi-pencil"
              severity="warn"
              rounded
              @click="selectRow(data)"
            ></Button>
            <Button
              v-if="data"
              icon="pi pi-trash"
              severity="danger"
              rounded
              @click="destroyQuestionnaire(data, $event)"
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
        <template #empty> Không tìm thấy bảng câu đố trong CSDL. </template>
      </DataTable>
    </template>
  </Card>
</template>
