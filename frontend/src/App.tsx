import AppRoutes from "./router/AppRoutes";
import useIdleLogout from "./hooks/useIdleLogout";

export default function App() {
  useIdleLogout(); // 👈 THIS IS THE KEY LINE

  return <AppRoutes />;
}
