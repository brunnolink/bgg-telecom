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
    <header className="sticky top-0 z-40">
      <div className="bg-white/5 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3"> 
            <div className="leading-tight">
              <div className="text-white font-semibold tracking-wide">
                BGG-TELECOM
              </div>
              <div className="text-xs text-blue-200/80">
                Sistema de tickets e suporte
              </div>
            </div>
          </div>

          <div className="relative" ref={wrapRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="h-9 w-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center hover:bg-blue-700 transition cursor-pointer"
              aria-label="Abrir menu do perfil"
            >
              {initials}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950/90 backdrop-blur border border-white/10 rounded-xl shadow-xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="text-white font-semibold">{user?.name}</div>
                  <div className="text-sm text-blue-200/80 mt-1">
                    {user?.email}
                  </div>
                  <div className="mt-2 inline-flex text-xs px-2 py-1 rounded-full bg-white/10 text-blue-100">
                    {roleLabel(user?.role)}
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 text-red-300 cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
