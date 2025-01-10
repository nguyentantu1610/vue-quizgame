import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { headers, useCustomHeaders } from "@/composables/custom-headers";
import type Quiz from "@/interfaces/quiz";
import router from "@/router";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useGamesStore = defineStore("games", () => {
  const toast = useToast();
  // Init data
  // const results = ref();
  // const quizErrors = ref<Quiz>();

  // function $reset() {
  //   quizErrors.value = undefined;
  // }

  /**
   * This function perform fetch quizzes from server
   *
   * @param uri The fetch uri
   */
  // async function getQuizzes(uri: string) {
  //   useCustomHeaders(true);
  //   const { data, status } = await useGetFetch(uri, headers);
  //   status >= 200 && status <= 299
  //     ? (results.value = data.data)
  //     : (results.value = null);
  // }

  /**
   * This function perform create room
   *
   * @param {string} id The questionnaire id
   */
  async function createRoom(id: string) {
    useCustomHeaders(true);
    const formData = new FormData();
    formData.append("questionnaire_id", id);
    const { data, status } = await usePostOrPatchFetch(
      "POST",
      "/api/user/games",
      formData,
      headers
    );
    if (status >= 200 && status <= 299) {
      localStorage.setItem("room", `room.${data.data}`);
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
      return router.push({ name: "waiting-room" });
    }
    return toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  return {
    createRoom,
    //   results,
    //   getQuizzes,
    //   deleteQuiz,
    //   $reset,
    //   quizErrors,
    //   createOrUpdateQuiz,
  };
});
