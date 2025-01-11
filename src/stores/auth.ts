import type Auth from "@/interfaces/auth";
import router from "@/router";
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { useToast } from "primevue";
import type User from "@/interfaces/user";
import { headers, useCustomHeaders } from "@/composables/custom-headers";

export const useAuthStore = defineStore("auth", () => {
  const toast = useToast();
  // Init data
  const user = ref<User>();
  const authErrors = ref<Auth>();

  function $reset() {
    authErrors.value = undefined;
  }

  /**
   * This function perform login/register/forgot password/send code
   *
   * @param {string} uri The uri
   * @param {FormData} formData The form input data
   */
  async function auth(uri: string, formData: FormData) {
    $reset();
    useCustomHeaders(false);
    const { data, status } = await usePostOrPatchFetch(
      "POST",
      uri,
      formData,
      headers
    );
    if (status >= 200 && status <= 299) {
      if (uri === "/api/login") {
        localStorage.setItem("token", data.token);
        data.isAdmin
          ? router.push({ name: "admin" })
          : router.push({ name: "home" });
      }
      if (uri === "/api/register" || uri === "/api/forgot-password") {
        router.push({ name: "login" });
      }
      return toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    }
    status === 422 ? (authErrors.value = data.errors) : "";
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  // Check user
  async function checkUser() {
    useCustomHeaders(false);
    const { data, status } = await useGetFetch("/api/check-user", headers);
    status >= 200 && status <= 299
      ? (user.value = data.data)
      : (user.value = undefined);
  }

  // Logout system
  async function logout() {
    useCustomHeaders(true);
    const { data, status } = await useDeleteFetch("/api/logout", headers);
    if (status < 200 || status > 299) {
      return toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
    localStorage.getItem("token") ? localStorage.removeItem("token") : "";
    localStorage.getItem("room") ? localStorage.removeItem("room") : "";
    router.push({ name: "login" });
  }

  return { user, authErrors, $reset, auth, checkUser, logout };
});
