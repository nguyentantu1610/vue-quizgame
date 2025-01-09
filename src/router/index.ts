import { useGetFetch } from "@/composables/custom-fetch";
import { headers, useCustomHeaders } from "@/composables/custom-headers";
import { useAuthStore } from "@/stores/auth";
import { useGamesStore } from "@/stores/games";
import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // Home's route
      path: "/",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: false },
      redirect: { name: "home" },
      children: [
        {
          path: "/home",
          name: "home",
          component: () => import("../components/home/TheWelcome.vue"),
        },
      ],
    },
    {
      // Auth's routes
      path: "/auth",
      component: () => import("../views/AuthView.vue"),
      meta: { requiresAuth: false },
      redirect: { name: "login" },
      children: [
        {
          path: "/login",
          name: "login",
          component: () => import("../components/auth/Login.vue"),
          meta: {
            enter: "animate__animated animate__fadeInLeft",
            leave: "animate__animated animate__fadeOutRight animate__faster",
          },
        },
        {
          path: "/register",
          name: "register",
          component: () => import("../components/auth/Register.vue"),
          meta: {
            enter: "animate__animated animate__fadeInRight",
            leave: "animate__animated animate__fadeOutLeft animate__faster",
          },
        },
        {
          path: "/forgot-password",
          name: "forgot-password",
          component: () => import("../components/auth/ForgotPassword.vue"),
          meta: {
            enter: "animate__animated animate__fadeInRight",
            leave: "animate__animated animate__fadeOutLeft animate__faster",
          },
        },
      ],
    },
    {
      // Admin's route
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAdmin: true },
      children: [
        {
          path: "users",
          name: "users",
          component: () =>
            import("../components/admin/users/UserManagement.vue"),
        },
      ],
    },
    {
      // User's route
      path: "/user",
      component: () => import("../views/UserView.vue"),
      meta: { requiresAuth: true },
      redirect: { name: "profile" },
      children: [
        {
          path: "profile",
          name: "profile",
          component: () => import("../components/user/UserProfile.vue"),
        },
        {
          path: "questionnaire-detail/:id",
          name: "questionnaire-detail",
          component: () => import("../components/user/QuestionnaireDetail.vue"),
          // Check the current user can see the specific questionnaire detail
          beforeEnter: async (to) => {
            useCustomHeaders(true);
            const { status } = await useGetFetch(
              `/api/user/questionnaires/${to.params.id}`,
              headers
            );
            return status === 403 ? { name: "NotFound" } : true;
          },
        },
        {
          path: "waiting-room/:id?/:code?",
          name: "waiting-room",
          component: () => import("../components/user/game/WaitingRoom.vue"),
          // Check the current user can create/join room
          beforeEnter: async (to) => {
            const room = localStorage.getItem("room");
            const id = to.params.id;
            const code = to.params.code;
            if (id && !room) {
              const { createRoom } = useGamesStore();
              await createRoom(`/api/user/games/${id}?_method=PATCH`);
            }
            return id || code ? true : router.go(-1);
          },
        },
      ],
    },
    {
      // Not found route
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue"),
      meta: { requiresAuth: false },
    },
  ],
  linkExactActiveClass:
    "border-l-2 border-zinc-950 dark:border-zinc-50 bg-slate-100 dark:bg-zinc-800",
});

// My Guardian
router.beforeEach(async (to) => {
  const { checkUser } = useAuthStore();
  const { user } = storeToRefs(useAuthStore());

  await checkUser();
  // Redirect to home if this user has logined
  if (
    !to.meta.requiresAuth &&
    user.value?.email &&
    (to.name === "login" ||
      to.name === "register" ||
      to.name === "forgot-password")
  ) {
    return { name: "home" };
  }
  // Redirect to login if user hasn't logined
  if (
    (to.meta.requiresAuth || to.meta.requiresAdmin) &&
    !user.value?.email &&
    to.name !== "login"
  ) {
    return { name: "login" };
  }
  // Redirect to not found if this user is not admin
  if (to.meta.requiresAdmin && !user.value?.is_admin) {
    return { name: "NotFound" };
  }
  return true;
});

export default router;
