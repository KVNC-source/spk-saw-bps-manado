import { Outlet } from "react-router-dom";
import KetuaSidebar from "./KetuaSidebar";

export default function KetuaLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <KetuaSidebar />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
