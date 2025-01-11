import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { headers, useCustomHeaders } from "@/composables/custom-headers";
import echo from "@/composables/my-echo";
import type Quiz from "@/interfaces/quiz";
import router from "@/router";
import { defineStore, storeToRefs } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";
import { useAuthStore } from "./auth";

interface Member {
  id: string;
  name: string;
  relation: string;
}

export const useGamesStore = defineStore("games", () => {
  const toast = useToast();
  // Init data
  const isListening = ref<boolean>(false);
  const players = ref<Array<Member>>();
  const relation = ref<string>("");
  const { user } = storeToRefs(useAuthStore());

  /**
   * This function handle open room
   *
   * @param event The response from server
   */
  const openRoom = (event: any) =>
    toast.add({
      severity: "success",
      summary: "Thành công",
      detail: event.message,
      life: 3000,
    });

  /**
   * This function handle stop game
   *
   * @param event The response from server
   * @param room The room name (channel)
   */
  function stopRoom(event: any, room: string) {
    echo.leave(room);
    isListening.value = false;
    localStorage.removeItem("room");
    router.push({ name: "home" });
    toast.add({
      severity: "info",
      summary: "Thông báo",
      detail: event.message,
      life: 3000,
    });
  }

  /**
   * This function was call when some player was removed
   *
   * @param event The response from server
   * @param room The room name (channel)
   */
  const removePlayer = (event: any, room: string) => {
    if (event.data === user.value?.id) {
      echo.leave(room);
      isListening.value = false;
      localStorage.removeItem("room");
      router.push({ name: "home" });
    }
  };

  /**
   * This function handle enter room
   *
   * @param users The response from server
   */
  function enterRoom(users: Array<Member>) {
    isListening.value = true;
    players.value = users;
    relation.value = users.filter(
      (item) => item.id === user.value?.id
    )[0].relation;
  }

  /**
   * This function new user join room
   *
   * @param users The response from server
   */
  function otherJoinRoom(user: Member) {
    players.value?.push(user);
    toast.add({
      severity: "info",
      summary: "Thông báo",
      detail: `${user.name} vào phòng~`,
      life: 3000,
    });
  }

  /**
   * This function trigger when another user leave room
   *
   * @param users The response from server
   */
  function otherLeaveRoom(user: Member) {
    players.value = players.value?.filter((item) => item.id !== user.id);
    toast.add({
      severity: "info",
      summary: "Thông báo",
      detail: `${user.name} rời phòng~`,
      life: 3000,
    });
  }

  /**
   * This function handle error room
   *
   * @param error The response from server
   */
  function errorRoom(error: any) {
    isListening.value = false;
    localStorage.removeItem("room");
    router.push({ name: "home" });
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: error.error,
      life: 3000,
    });
    console.error(error);
  }

  // This function perform join room
  function joinRoom() {
    const room = localStorage.getItem("room");
    if (room) {
      const channel = echo
        .join(room)
        .listen("OpenRoom", (event: any) => openRoom(event))
        .listen("StopRoom", (event: any) => stopRoom(event, room))
        .listen("RemovePlayer", (event: any) => removePlayer(event, room))
        .here((users: any) => enterRoom(users))
        .joining((user: any) => otherJoinRoom(user))
        .leaving((user: any) => otherLeaveRoom(user))
        .error((error: any) => errorRoom(error));
    }
    router.back();
  }

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
      router.push({ name: "room" });
      return toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    }
    return toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  /**
   * This function perform remove player
   *
   * @param {string} uri The fetch uri
   */
  async function destroy(uri: string) {
    useCustomHeaders(true);
    const { data, status } = await useDeleteFetch(
      `${uri}?code=${localStorage.getItem("room")?.split(".")[1]}`,
      headers
    );
    if (status < 200 && status > 299) {
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
  }

  return {
    createRoom,
    joinRoom,
    players,
    isListening,
    relation,
    destroy,
  };
});
