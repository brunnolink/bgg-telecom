import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function roleLabel(role?: string) {
  if (role === "TECH") return "Técnico";
  if (role === "CLIENT") return "Cliente";
  return role ?? "";
}

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const n = (user?.name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] ?? "U";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  }, [user?.name]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
 
        <div className="flex items-center gap-3">
   
          <img
            src="../public/logo.png"
            alt="Logo"
            className="h-8 w-8 rounded-lg"
            draggable={false}
          />
          <span className="font-semibold text-lg">TicketFlow</span>
        </div>
  
        <div className="relative" ref={wrapRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={[
              "cursor-pointer h-9 w-9 rounded-full bg-blue-600 text-white font-semibold",
              "flex items-center justify-center",
              "hover:bg-blue-700 transition",
              "focus:outline-none focus:ring-2 focus:ring-blue-300",
            ].join(" ")}
            aria-label="Abrir menu do perfil"
          >
            {initials}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="font-semibold leading-tight">{user?.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {user?.email}
                </div>
                <div className="mt-2 inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {roleLabel(user?.role)}
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 text-red-600"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
