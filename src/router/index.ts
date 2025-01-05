import { useAuthStore } from "@/stores/auth";
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
