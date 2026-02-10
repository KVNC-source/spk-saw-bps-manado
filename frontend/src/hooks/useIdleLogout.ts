import { useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour

export default function useIdleLogout() {
  const { user, logout } = useAuth();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return; // ⛔ do NOTHING if not logged in

    const resetTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        console.log("⏰ Idle timeout → logout");
        logout(); // ✅ use AuthContext logout
      }, IDLE_TIMEOUT);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [user, logout]);
}
