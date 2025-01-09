import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { headers, useCustomHeaders } from "@/composables/custom-headers";
import type Quiz from "@/interfaces/quiz";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useQuizzesStore = defineStore("quizzes", () => {
  const toast = useToast();
  // Init data
  const results = ref();
  const quizErrors = ref<Quiz>();

  function $reset() {
    quizErrors.value = undefined;
  }

  /**
   * This function perform fetch quizzes from server
   *
   * @param uri The fetch uri
   */
  async function getQuizzes(uri: string) {
    useCustomHeaders(true);
    const { data, status } = await useGetFetch(uri, headers);
    status >= 200 && status <= 299
      ? (results.value = data.data)
      : (results.value = null);
  }

  /**
   * This function perform create/update quiz
   *
   * @param {string} uri The fetch uri
   * @param {any} formData The fetch body
   */
  async function createOrUpdateQuiz(uri: string, formData: any) {
    $reset();
    useCustomHeaders(true);
    const frmDT = new FormData();
    frmDT.append("questionnaire_id", formData.questionnaire_id);
    frmDT.append("question", formData.question);
    frmDT.append("answer[]", formData.answer1);
    frmDT.append("answer[]", formData.answer2);
    formData.answer3 ? frmDT.append("answer[]", formData.answer3) : "";
    formData.answer3 ? frmDT.append("answer[]", formData.answer4) : "";
    frmDT.append("right_answer", formData.right_answer);
    frmDT.append("time", formData.time);
    const { data, status } = await usePostOrPatchFetch(
      "POST",
      uri,
      frmDT,
      headers
    );
    if (status >= 200 && status <= 299) {
      return toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    }
    status === 422 ? (quizErrors.value = data.errors) : "";
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  /**
   * This function perform delete quiz
   *
   * @param uri The fetch uri
   */
  async function deleteQuiz(uri: string) {
    useCustomHeaders(true);
    const { data, status } = await useDeleteFetch(uri, headers);
    status >= 200 && status <= 299
      ? toast.add({
          severity: "success",
          summary: "Thành công",
          detail: data.message,
          life: 3000,
        })
      : toast.add({
          severity: "error",
          summary: "Lỗi",
          detail: data.message,
          life: 3000,
        });
  }

  return {
    results,
    getQuizzes,
    deleteQuiz,
    $reset,
    quizErrors,
    createOrUpdateQuiz,
  };
});
