"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Connection = "connecting" | "live" | "reconnecting" | "offline";
const Notifications = createContext({
  revision: 0,
  status: "connecting" as Connection,
  refresh: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<Connection>("connecting");
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let socket: WebSocket | undefined,
      retry: ReturnType<typeof setTimeout> | undefined;
    let opening: ReturnType<typeof setTimeout> | undefined,
      batch: ReturnType<typeof setTimeout> | undefined;
    let stopped = false,
      attempts = 0;
    const sync = () => {
      clearTimeout(batch);
      batch = setTimeout(() => {
        if (!stopped) refresh();
      }, 100);
    };
    const connect = () => {
      if (
        stopped ||
        socket?.readyState === WebSocket.OPEN ||
        socket?.readyState === WebSocket.CONNECTING
      )
        return;
      clearTimeout(retry);
      if (!navigator.onLine) {
        setStatus("offline");
        return;
      }
      setStatus(attempts ? "reconnecting" : "connecting");
      const url = new URL(
        "/api/collaboration/notifications/socket",
        window.location.href,
      );
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      const current = new WebSocket(url);
      socket = current;
      opening = setTimeout(() => current.close(), 10000);
      current.onmessage = (event) => {
        if (stopped || socket !== current) return;
        try {
          const message = JSON.parse(event.data);
          if (message.type === "notifications:ready") {
            clearTimeout(opening);
            attempts = 0;
            setStatus("live");
            sync(); // Reconcile persisted updates after every reconnect.
          } else if (message.type === "notifications:changed") sync();
        } catch {
          /* Ignore unrecognized protocol messages. */
        }
      };
      current.onclose = (event) => {
        clearTimeout(opening);
        if (stopped || socket !== current) return;
        socket = undefined;
        if (event.code === 4401) {
          stopped = true;
          window.dispatchEvent(new Event("sleektech:unauthorized"));
          return;
        }
        setStatus(navigator.onLine ? "reconnecting" : "offline");
        if (navigator.onLine)
          retry = setTimeout(
            connect,
            Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5)) +
              Math.random() * 500,
          );
      };
    };
    const wake = () => {
      if (stopped || document.visibilityState !== "visible") return;
      if (socket?.readyState === WebSocket.OPEN) sync();
      else connect();
    };
    const offline = () => {
      setStatus("offline");
      socket?.close();
    };
    connect();
    window.addEventListener("online", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("offline", offline);
    return () => {
      stopped = true;
      clearTimeout(retry);
      clearTimeout(opening);
      clearTimeout(batch);
      socket?.close();
      window.removeEventListener("online", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("offline", offline);
    };
  }, [refresh]);
  return (
    <Notifications.Provider value={{ revision, status, refresh }}>
      {children}
    </Notifications.Provider>
  );
}

export const useNotifications = () => useContext(Notifications);
