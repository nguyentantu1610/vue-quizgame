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
  // Retrieve token in local storage and add to headers if present
  const token = localStorage.getItem("token");
  token ? headers.append("Authorization", `Bearer ${token}`) : "";
  // If require auth but token not valid then return to login
  requiresAuth && !token ? router.push({ name: "login" }) : "";
}

export { useCustomHeaders, headers };
