import { Outlet } from "react-router-dom";
import MitraNavbar from "./MitraNavbar";

export default function MitraLayout() {
  return (
    <>
      <MitraNavbar />
      <main className="layout-content">
        <Outlet />
      </main>
    </>
  );
}
