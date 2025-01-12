import Pusher from "pusher-js";
import Echo from "laravel-echo";

// Use Pusher
(window as any).Pusher = Pusher;

// Use Laravel Echo
let echoInstance: any = null;

function createEchoInstance() {
  const token = localStorage.getItem("token");
  // If token not init then return null
  if (!token) {
    console.error("Token không có sẵn");
    return null;
  }
  // Secure that only one instance exist
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: import.meta.env.VITE_REVERB_PORT,
      wssPort: import.meta.env.VITE_REVERB_PORT,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/broadcasting/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
  return echoInstance;
}

// Get echo instance
export function getEchoInstance() {
  return createEchoInstance();
}
