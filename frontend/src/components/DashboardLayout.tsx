import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-red-600 font-medium hover:underline"
        >
          Logout
        </button>
      </header>

      <main className="p-8">{children}</main>
    </div>
  );
}
