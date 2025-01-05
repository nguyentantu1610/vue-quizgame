import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { headers, useCustomHeaders } from "@/composables/custom-headers";
import type User from "@/interfaces/user";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useUsersStore = defineStore("users", () => {
  const toast = useToast();
  // Init data
  const results = ref();
  const userErrors = ref<User>();

  function $reset() {
    userErrors.value = undefined;
  }

  /**
   * This function perform fetch users from server
   *
   * @param uri The fetch uri
   */
  async function getUsers(uri: string) {
    useCustomHeaders(true);
    const { data, status } = await useGetFetch(uri, headers);
    status >= 200 && status <= 299
      ? (results.value = data.data)
      : (results.value = null);
  }

  /**
   * This function to export data to excel file
   *
   */
  async function exportData() {
    if ("showDirectoryPicker" in window) {
      useCustomHeaders(true);
      headers.set("Accept", "application/json, text/csv");
      const { status, fileName, data } = await useGetFetch(
        "/api/admin/users/export",
        headers
      );
      if (status >= 200 && status <= 299) {
        try {
          const directoryHandle = await (window as any).showDirectoryPicker();
          const fileHandle = await directoryHandle.getFileHandle(fileName, {
            create: true,
          });
          const writer = await fileHandle.createWritable();
          await writer.write(data);
          await writer.close();
          return toast.add({
            severity: "success",
            summary: "Thành công",
            detail: "Xuất file thành công~",
            life: 3000,
          });
        } catch (error) {
          console.error(error);
        }
      }
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: "Xuất file thất bại",
        life: 3000,
      });
    }
  }

  /**
   * This function to update user
   *
   * @param {string} uri The fetch uri
   * @param {FormData} formData The fetch body
   */
  async function updateUser(uri: string, formData: FormData) {
    $reset();
    useCustomHeaders(true);
    const { data, status } = await usePostOrPatchFetch(
      "POST",
      uri,
      formData,
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
    status === 422 ? (userErrors.value = data.errors) : "";
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  /**
   * This function to delete user
   *
   * @param uri The fetch uri
   */
  async function deleteUser(uri: string) {
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

  /**
   * This function to restore user
   *
   * @param {string} uri The fetch uri
   */
  async function restoreUser(uri: string) {
    useCustomHeaders(true);
    const { data, status } = await usePostOrPatchFetch(
      "PATCH",
      uri,
      new FormData(),
      headers
    );
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
    getUsers,
    deleteUser,
    exportData,
    restoreUser,
    $reset,
    userErrors,
    updateUser,
  };
});
