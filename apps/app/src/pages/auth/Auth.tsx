import { useState } from "react";
import { login } from "../../api/auth";
import { registerUser } from "../../api/user";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../../contexts/AuthContext";

type Tab = "login" | "register";

export function Auth() {
  const navigate = useNavigate();
  const { login: doLogin } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "TECH">("CLIENT");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const data = await login(email, password);
      doLogin({ token: data.token, user: data.user });
      navigate("/tickets", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro no login");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setIsSubmitting(true);
    try {
      await registerUser({
        name,
        email: regEmail,
        password: regPassword,
        role,
      });

      setSuccess("Usuário criado! Agora faça login.");
      setTab("login");
 
      setEmail(regEmail);
      setPassword("");
      setName("");
      setRegEmail("");
      setRegPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao cadastrar usuário");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-slate-950 flex items-center justify-center px-4">
 
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
 
      <div className="relative w-full max-w-md flex flex-col items-center gap-5">
   
        <div className="w-full text-center text-white">
          <div className="flex items-center justify-center gap-3"> 
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <span className="text-lg font-bold">BGG</span>
            </div>

            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-wide leading-tight">
                BGG-TELECOM
              </h1>
              <p className="text-sm text-blue-200">
                Sistema de tickets e suporte técnico
              </p>
            </div>
          </div>
        </div>
 
        <div className="w-full bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/10 p-6">
     
          <div className="flex gap-2 mb-6 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={[
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-300",
                tab === "login"
                  ? "bg-white shadow text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
              ].join(" ")}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setTab("register")}
              className={[
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-300",
                tab === "register"
                  ? "bg-white shadow text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
              ].join(" ")}
            >
              Cadastre-se
            </button>
          </div>
 
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Entrar</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input
                  type="password"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Entrar
              </button>
            </form>
          )}
 
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Criar conta</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input
                  type="password"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "CLIENT" | "TECH")}
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="TECH">Técnico</option>
                </select>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  "w-full py-2 rounded-lg transition text-white cursor-pointer",
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700",
                ].join(" ")}
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
          )}
        </div>
 
        <p className="text-xs text-blue-200/80 text-center w-full">
          Centralize e acompanhe chamados com mais agilidade.
        </p>
      </div>
    </div>
  );
}
