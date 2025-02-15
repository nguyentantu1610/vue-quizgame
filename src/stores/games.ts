import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { headers, useCustomHeaders } from "@/composables/custom-headers";
import router from "@/router";
import { defineStore, storeToRefs } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";
import { useAuthStore } from "./auth";
import { getEchoInstance } from "@/composables/my-echo";

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
  const loading = ref<boolean>(false);
  const roomStatus = ref<string>("");
  const quiz = ref<{ question: string; answer: string }>({
    question: "",
    answer: "",
  });
  const leaderboard =
    ref<Array<{ name: string | null; email: string; score: number }>>();
  const score = ref<number>(0);
  const time = ref<number>(0);
  const answered = ref<number>(0);
  let channel: any;

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
    loading.value = false;
    getEchoInstance().leave(room);
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
    loading.value = false;
    if (event.data === user.value?.id) {
      getEchoInstance().leave(room);
      isListening.value = false;
      localStorage.removeItem("room");
      router.push({ name: "home" });
    }
  };

  /**
   * This function handle quiz response from server
   *
   * @param event The response from server
   */
  function handleResponseQuiz(event: any) {
    loading.value = false;
    quiz.value.question = event.data.question;
    quiz.value.answer = event.data.answer;
    answered.value = event.data.answered;
    roomStatus.value = "playing";
    handleTime(event.data.time);
    toast.add({
      severity: "success",
      summary: "Thành công",
      detail: event.message,
      life: 3000,
    });
    startCountdown();
  }

  /**
   * This function handle leaderboard response from server
   *
   * @param event The response from server
   */
  function handleResponseLeaderboard(event: any) {
    leaderboard.value = event.data;
    roomStatus.value = "finished";
    if (relation.value === "player") {
      score.value = event.data.filter(
        (item: any) => item.id === user.value?.id
      )[0].score;
    }
    toast.add({
      severity: "success",
      summary: "Thành công",
      detail: event.message,
      life: 3000,
    });
  }

  /**
   * This function handle enter room
   *
   * @param users The response from server
   */
  async function enterRoom(users: Array<Member>) {
    isListening.value = true;
    players.value = users;
    relation.value = users.filter(
      (item) => item.id === user.value?.id
    )[0].relation;
    await getData();
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
      channel = getEchoInstance()
        .join(room)
        .listen("OpenRoom", (event: any) => openRoom(event))
        .listen("StopRoom", (event: any) => stopRoom(event, room))
        .listen("RemovePlayer", (event: any) => removePlayer(event, room))
        .listen("SendQuiz", (event: any) => handleResponseQuiz(event))
        .listen("SendLeaderboard", (event: any) =>
          handleResponseLeaderboard(event)
        )
        .listenForWhisper("answered", (event: any) => {
          answered.value = event.answered;
        })
        .here(async (users: any) => await enterRoom(users))
        .joining((user: any) => otherJoinRoom(user))
        .leaving((user: any) => otherLeaveRoom(user))
        .error((error: any) => errorRoom(error));
    }
    router.push({ name: "home" });
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
    loading.value = true;
    useCustomHeaders(true);
    const { data, status } = await useDeleteFetch(
      `${uri}?code=${localStorage.getItem("room")?.split(".")[1]}`,
      headers
    );
    if (status < 200 || status > 299) {
      loading.value = false;
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
  }

  /**
   * This function perform get room data
   */
  async function getData() {
    useCustomHeaders(true);
    const { data, status } = await useGetFetch(
      `/api/user/games/status?code=${
        localStorage.getItem("room")?.split(".")[1]
      }`,
      headers
    );
    if (status < 200 || status > 299) {
      return toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
    roomStatus.value = data.data.status;
    score.value = data.data.score;
    if (roomStatus.value === "playing") {
      quiz.value.question = data.data.question;
      quiz.value.answer = data.data.answer;
      answered.value = data.data.answered;
      handleTime(data.data.time + " UTC");
      startCountdown();
    }
    if (roomStatus.value === "finished") {
      leaderboard.value = data.data.leaderboard;
      handleTime(data.data.time + " UTC");
    }
  }

  /**
   * This function perform start game
   */
  async function startGame() {
    loading.value = true;
    useCustomHeaders(true);
    const { data, status } = await useGetFetch(
      `/api/user/games/start?code=${
        localStorage.getItem("room")?.split(".")[1]
      }`,
      headers
    );
    if (status < 200 || status > 299) {
      loading.value = false;
      return toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
  }

  // This function handle time
  function handleTime(date: string) {
    let finishTime = new Date(date).getTime();
    let now = new Date().getTime();
    time.value = Math.round((finishTime - now) / 1000);
  }

  /**
   * This function perform send answer
   *
   * @param {string} answer The answer
   */
  async function sendAnswer(answer: string) {
    loading.value = true;
    useCustomHeaders(true);
    const formData = new FormData();
    formData.append("answer", answer);
    const { data, status } = await usePostOrPatchFetch(
      "POST",
      `/api/user/games/answer?code=${
        localStorage.getItem("room")?.split(".")[1]
      }`,
      formData,
      headers
    );
    loading.value = false;
    if (status < 200 || status > 299) {
      return toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
    roomStatus.value = "pending";
    answered.value++;
    channel.whisper("answered", {
      answered: answered.value,
    });
  }

  // count down
  function startCountdown() {
    let countDown = setInterval(() => {
      time.value--;
      if (time.value === 0) {
        clearInterval(countDown);
      }
    }, 1000);
  }

  return {
    createRoom,
    joinRoom,
    players,
    isListening,
    relation,
    destroy,
    loading,
    roomStatus,
    quiz,
    leaderboard,
    score,
    time,
    answered,
    startGame,
    sendAnswer,
  };
});
