import router from "@/router";

// Init headers
let headers = new Headers();

/**
 * The custom headers for fetch
 *
 * @param {boolean} requiresAuth Check require auth or not
 */
function useCustomHeaders(requiresAuth: boolean) {
  // Reset headers
  headers = new Headers();
  headers.append("Accept", "application/json");
  // If require auth then add Bearer token
  if (requiresAuth) {
    const token = localStorage.getItem("token");
    token
      ? headers.append("Authorization", `Bearer ${token}`)
      : router.push({ name: "login" });
  }
}

export { useCustomHeaders, headers };
