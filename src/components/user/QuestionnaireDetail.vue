<script setup lang="ts">
import type Quiz from "@/interfaces/quiz";
import { useQuizzesStore } from "@/stores/quizzes";
import { storeToRefs } from "pinia";
import { useConfirm } from "primevue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const { getQuizzes, createOrUpdateQuiz, deleteQuiz } = useQuizzesStore();
const { results, quizErrors } = storeToRefs(useQuizzesStore());
const confirm = useConfirm();
// Init data
const questionnaireID = route.params.id;
const quizzes = ref<Array<Quiz> | null>(null);
const loading = ref<boolean>(false);
const formData = ref({
  id: "",
  questionnaire_id: questionnaireID,
  question: "",
  answer1: "",
  answer2: "",
  answer3: "",
  answer4: "",
  right_answer: "",
  time: "",
});

// Get all quizzes of this questionnaire
async function getAllQuizzes() {
  await getQuizzes(`/api/user/questionnaires/${questionnaireID}`);
  quizzes.value = results.value;
}

// Get all quizzes of this questionnaire
onMounted(async () => await getAllQuizzes());

// Handle update user
async function handleSubmitForm() {
  loading.value = true;
  formData.value.id
    ? await createOrUpdateQuiz(
        `/api/user/quizzes/${formData.value.id}?_method=PATCH`,
        formData.value
      )
    : await createOrUpdateQuiz("/api/user/quizzes", formData.value);
  loading.value = false;
  if (!quizErrors.value) {
    formData.value.id ? "" : refreshFormData();
    await getAllQuizzes();
  }
}

// Refresh form data to primitive value
const refreshFormData = () =>
  (formData.value = {
    id: "",
    questionnaire_id: questionnaireID,
    question: "",
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: "",
    right_answer: "",
    time: "",
  });

// Choose quiz to view detail/update
function chooseQuiz(item: any) {
  formData.value.id = item.id;
  formData.value.question = item.question;
  const answer: Array<string> = item.answer.split(",");
  formData.value.answer1 = answer[0];
  formData.value.answer2 = answer[1];
  formData.value.answer3 = answer[2] ?? "";
  formData.value.answer4 = answer[3] ?? "";
  formData.value.right_answer = item.right_answer;
  formData.value.time = item.time;
}

// Handle delete/restore category
const destroyQuiz = (event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: "Bạn có chắc là muốn xoá câu đố này?",
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
      await deleteQuiz(`/api/user/quizzes/${formData.value.id}`);
      refreshFormData();
      await getAllQuizzes();
    },
    reject: () => console.log(`xoá ${formData.value.id} thất bại~`),
  });
};
</script>

<template>
  <div class="flex flex-row h-full">
    <Card class="basis-1/5 overflow-x-auto">
      <template #content>
        <DataView :value="quizzes" data-key="1" v-if="quizzes">
          <template #list="slotProps">
            <div class="flex flex-col">
              <div v-for="(item, index) in slotProps.items" :key="index">
                <div
                  class="border rounded-md border-surface-200 dark:border-surface-700 mb-3 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  :class="{
                    'bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950':
                      formData.id === item.id,
                  }"
                  @click="chooseQuiz(item)"
                >
                  <p
                    class="h-12 text-center pt-3 whitespace-nowrap text-ellipsis overflow-hidden w-60"
                  >
                    {{ `Câu ${index + 1}: ${item.question}` }}
                  </p>
                </div>
              </div>
              <div class="w-full">
                <Button
                  icon="pi pi-plus-circle"
                  label="Thêm mới"
                  fluid
                  @click="refreshFormData"
                />
              </div>
            </div>
          </template>
          <template #empty>Bảng câu đố này chưa có câu hỏi nào.</template>
        </DataView>
      </template>
    </Card>
    <Card class="basis-3/5 m-10">
      <template #title>
        {{ formData.id ? "Cập Nhật" : "Thêm" + " Câu Đố" }}
      </template>
      <template #content>
        <form
          v-focustrap
          @submit.prevent="handleSubmitForm"
          class="flex flex-col mt-3 gap-6 items-center"
        >
          <div class="w-full">
            <FloatLabel variant="on">
              <InputText
                type="text"
                id="question"
                fluid
                maxlength="100"
                :invalid="!!quizErrors?.question"
                :disabled="loading"
                v-model="formData.question"
              />
              <label for="question">Câu đố</label>
            </FloatLabel>
            <Message
              v-if="quizErrors?.question"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ quizErrors.question[0] }}
            </Message>
          </div>
          <div class="flex flex-row gap-4 w-full">
            <div class="basis-1/2">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="answer1"
                  fluid
                  maxlength="50"
                  :invalid="quizErrors ? !!((quizErrors as any)['answer.0']) : false"
                  :disabled="loading"
                  v-model="formData.answer1"
                />
                <label for="answer1">Câu trả lời 1</label>
              </FloatLabel>
              <Message
                v-if="quizErrors ? (quizErrors as any)['answer.0'] : 0"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ (quizErrors as any)["answer.0"][0] }}
              </Message>
            </div>
            <div class="basis-1/2">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="answer2"
                  fluid
                  maxlength="50"
                  :invalid="quizErrors ? !!((quizErrors as any)['answer.1']) : false"
                  :disabled="loading"
                  v-model="formData.answer2"
                />
                <label for="answer2">Câu trả lời 2</label>
              </FloatLabel>
              <Message
                v-if="quizErrors ? (quizErrors as any)['answer.1'] : 0"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ (quizErrors as any)["answer.1"][0] }}
              </Message>
            </div>
          </div>
          <div class="flex flex-row gap-4 w-full">
            <div class="basis-1/2">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="answer3"
                  fluid
                  maxlength="50"
                  :invalid="quizErrors ? !!((quizErrors as any)['answer.2']) : false"
                  :disabled="loading"
                  v-model="formData.answer3"
                />
                <label for="answer3">Câu trả lời 3</label>
              </FloatLabel>
              <Message
                v-if="quizErrors ? (quizErrors as any)['answer.2'] : 0"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ (quizErrors as any)["answer.2"][0] }}
              </Message>
            </div>
            <div class="basis-1/2">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="answer4"
                  fluid
                  maxlength="50"
                  :invalid="quizErrors ? !!((quizErrors as any)['answer.3']) : false"
                  :disabled="loading"
                  v-model="formData.answer4"
                />
                <label for="answer4">Câu trả lời 4</label>
              </FloatLabel>
              <Message
                v-if="quizErrors ? (quizErrors as any)['answer.3'] : 0"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ (quizErrors as any)["answer.3"][0] }}
              </Message>
            </div>
          </div>
          <div class="flex flex-row gap-4 w-full">
            <div class="basis-1/2">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="right_answer"
                  fluid
                  maxlength="50"
                  :invalid="!!quizErrors?.right_answer"
                  :disabled="loading"
                  v-model="formData.right_answer"
                />
                <label for="right_answer">Câu trả lời đúng</label>
              </FloatLabel>
              <Message
                v-if="quizErrors?.right_answer"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ quizErrors.right_answer[0] }}
              </Message>
            </div>
            <div class="basis-1/2">
              <FloatLabel variant="on">
                <InputMask
                  id="time"
                  fluid
                  mask="99"
                  v-model="formData.time"
                  :invalid="!!quizErrors?.time"
                  :disabled="loading"
                />
                <label for="time">Thời gian</label>
              </FloatLabel>
              <Message
                v-if="quizErrors?.time"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ quizErrors.time[0] }}
              </Message>
            </div>
          </div>
          <div class="flex flex-row gap-4">
            <Button
              v-if="formData.id"
              label="Xoá"
              severity="danger"
              @click="destroyQuiz($event)"
            ></Button>
            <Button
              type="submit"
              :label="formData.id ? 'Cập nhật' : 'Thêm mới'"
              :loading="loading"
            ></Button>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
