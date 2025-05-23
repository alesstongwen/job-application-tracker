import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const Route = createFileRoute("/")({
  component: HomePage,
  beforeLoad: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/check`, {
      credentials: "include",
    });

    if (res.ok) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function HomePage() {
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to Job Tracker!</h1>
      <p className="mb-6 text-center max-w-md">
        Track your job applications easily with drag & drop functionality. Login
        to get started!
      </p>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-3 rounded"
      >
        Login
      </button>
    </div>
  );
}

export default HomePage;
