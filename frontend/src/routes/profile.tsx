import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

const logout = async () => {
  try {
    await axios.get("/auth/logout", { withCredentials: true });
    window.location.href = "http://localhost:3000/auth/register"; // Redirect to login page after logout
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
