import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { headers, useCustomHeaders } from "@/composables/custom-headers";
import type Questionnaire from "@/interfaces/questionnaire";
import router from "@/router";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useQuestionnairesStore = defineStore("questionnaires", () => {
  const toast = useToast();
  // Init data
  const results = ref();
  const questionnaireErrors = ref<Questionnaire>();

  function $reset() {
    questionnaireErrors.value = undefined;
  }

  /**
   * This function perform fetch questionnaires from server
   *
   * @param uri The fetch uri
   */
  async function getQuestionnaires(uri: string) {
    useCustomHeaders(true);
    const { data, status } = await useGetFetch(uri, headers);
    status >= 200 && status <= 299
      ? (results.value = data.data)
      : (results.value = null);
  }

  /**
   * This function perform create/update questionnaire
   *
   * @param {string} uri The fetch uri
   * @param {FormData} formData The fetch body
   */
  async function createOrUpdateQuestionnaire(uri: string, formData: FormData) {
    $reset();
    useCustomHeaders(true);
    const { data, status } = await usePostOrPatchFetch(
      "POST",
      uri,
      formData,
      headers
    );
    if (status >= 200 && status <= 299) {
      data.data.id
        ? router.push({
            name: "questionnaire-detail",
            params: { id: data.data.id },
          })
        : "";
      return toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    }
    status === 422 ? (questionnaireErrors.value = data.errors) : "";
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  /**
   * This function perform delete questionnaire
   *
   * @param uri The fetch uri
   */
  async function deleteQuestionnaire(uri: string) {
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
    getQuestionnaires,
    deleteQuestionnaire,
    $reset,
    questionnaireErrors,
    createOrUpdateQuestionnaire,
  };
});
