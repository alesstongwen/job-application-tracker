import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

const logout = async () => {
  try {
    await axios.get(`${API_BASE_URL}/auth/logout`, { withCredentials: true });
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
function RouteComponent() {
  return (
    <button
      onClick={logout}
      className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
    >
      Logout
    </button>
  );
}
