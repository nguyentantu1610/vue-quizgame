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

export default router;
