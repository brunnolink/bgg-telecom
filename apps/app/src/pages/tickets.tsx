import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Eye, Pencil, Trash2, User as UserIcon, Clock3, Search, Wrench } from "lucide-react";
import type { Ticket, TicketPriority, TicketStatus } from "../types/model-types";
import { assignTicketToMe, createTicket, deleteTicket, listTickets, updateTicket } from "../api/tickets";
import { Topbar } from "../components/Topbar";

function StatusBadge({ status }: { status: TicketStatus }) {
  const map = {
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    DONE: "bg-green-100 text-green-700",
  } as const;

  const label =
    status === "OPEN" ? "Aberto" : status === "IN_PROGRESS" ? "Em Progresso" : "Concluído";

  return <span className={`text-xs px-3 py-1 rounded-full font-medium ${map[status]}`}>{label}</span>;
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const map = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-700",
  } as const;

  const label = priority === "LOW" ? "Baixa" : priority === "MEDIUM" ? "Média" : "Alta";

  return <span className={`text-xs px-3 py-1 rounded-full font-medium ${map[priority]}`}>{label}</span>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl px-4 py-3 flex items-baseline justify-between cursor-pointer">
      <div className="text-sm text-gray-600 cursor-pointer">{label}</div>
      <div className="text-xl font-semibold cursor-pointer">{value}</div>
    </div>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-white rounded-xl border shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
            Fechar
          </button>
        </div>
        <div className="p-4 bg-white">{children}</div>
      </div>
    </div>
  );
}

export function Tickets() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TicketPriority>("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cDescription, setCDescription] = useState("");
  const [cPriority, setCPriority] = useState<TicketPriority>("MEDIUM");
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | null>(null);

  const [eTitle, setETitle] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eStatus, setEStatus] = useState<TicketStatus>("OPEN");
  const [ePriority, setEPriority] = useState<TicketPriority>("MEDIUM");
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadTickets() {
    try {
      setLoading(true);
      setError(null);
      const data = await listTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" ? true : t.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" ? true : t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    progress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    done: tickets.filter((t) => t.status === "DONE").length,
  };

  function openCreate() {
    setCreateError(null);
    setCTitle("");
    setCDescription("");
    setCPriority("MEDIUM");
    setIsCreateOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (!cTitle.trim() || !cDescription.trim()) {
      setCreateError("Preencha título e descrição.");
      return;
    }

    try {
      setIsSaving(true);
      await createTicket({
        title: cTitle.trim(),
        description: cDescription.trim(),
        priority: cPriority,
        clientName: user?.name ?? "Cliente",
      });
      setIsCreateOpen(false);
      await loadTickets();
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? "Erro ao criar ticket");
    } finally {
      setIsSaving(false);
    }
  }

  function openView(ticket: Ticket) {
    setSelected(ticket);
    setMode("view");
  }

  function openEdit(ticket: Ticket) {
    setSelected(ticket);
    setMode("edit");
    setEditError(null);

    setETitle(ticket.title);
    setEDescription(ticket.description);
    setEStatus(ticket.status);
    setEPriority(ticket.priority);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setEditError(null);

    if (!eTitle.trim() || !eDescription.trim()) {
      setEditError("Título e descrição são obrigatórios.");
      return;
    }

    try {
      setIsUpdating(true);

      // ✅ CLIENT não manda status
      const payload: any = {
        title: eTitle.trim(),
        description: eDescription.trim(),
        priority: ePriority,
      };
      if (user?.role === "TECH") payload.status = eStatus;

      await updateTicket(selected.id, payload);

      setMode(null);
      setSelected(null);
      await loadTickets();
    } catch (err: any) {
      setEditError(err?.response?.data?.message ?? "Erro ao atualizar ticket");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(ticket: Ticket) {
    const ok = confirm(`Excluir o ticket "${ticket.title}"?`);
    if (!ok) return;

    try {
      await deleteTicket(ticket.id);
      await loadTickets();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Erro ao excluir ticket");
    }
  }

  async function handleAssign(ticket: Ticket) {
    try {
      await assignTicketToMe(ticket.id);
      await loadTickets();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Erro ao assumir ticket");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">Carregando tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              Olá, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm text-gray-600">Acompanhe seus tickets de suporte</p>
          </div>

          <button
            onClick={openCreate}
            className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            + Novo Ticket
          </button>
        </div>
 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Aberto" value={stats.open} />
          <StatCard label="Progresso" value={stats.progress} />
          <StatCard label="Concluídos" value={stats.done} />
        </div>
 
        <div className="bg-white border rounded-xl p-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Buscar tickets..."
                className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm bg-gray-50 focus:bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="border rounded-lg px-3 py-2 text-sm md:w-44 bg-white cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">Todos os status</option>
              <option value="OPEN">Aberto</option>
              <option value="IN_PROGRESS">Em Progresso</option>
              <option value="DONE">Concluído</option>
            </select>

            <select
              className="border rounded-lg px-3 py-2 text-sm md:w-44 bg-white cursor-pointer"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="ALL">Todas prioridades</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const showAssume =
              user?.role === "TECH" && !ticket.technicianId && ticket.status === "OPEN";

            return (
              <div
                key={ticket.id}
                className={[
                  "bg-white border rounded-xl p-4",
                  "transition-all duration-200",
                  "hover:shadow-md hover:-translate-y-[1px] hover:border-blue-200",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-base truncate">{ticket.title}</h2>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
 
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
                      <span className="inline-flex items-center gap-2">
                        <UserIcon size={14} />
                        {ticket.clientName}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={14} />
                        {ticket.createdAt}
                      </span>
                    </div>
 
                    <div className="mt-2 text-xs text-gray-600 inline-flex items-center gap-2">
                      <Wrench size={14} className="text-gray-500" />
                      {ticket.technicianId ? (
                        <span>Ticket atribuído a um técnico</span>
                      ) : (
                        <span>Ticket ainda não atribuído</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
 
                <div className="mt-3 flex justify-end gap-2">
                  {showAssume && (
                    <button
                      onClick={() => handleAssign(ticket)}
                      className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                      title="Assumir ticket"
                    >
                      Assumir
                    </button>
                  )}

                  <button
                    onClick={() => openView(ticket)}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition cursor-pointer"
                    title="Ver"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => openEdit(ticket)}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition cursor-pointer"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(ticket)}
                    className="p-2 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="text-sm text-gray-600 bg-white border rounded-xl p-4">
              Nenhum ticket encontrado.
            </div>
          )}
        </div>
      </div>
 
      {isCreateOpen && (
        <ModalShell title="Novo Ticket" onClose={() => setIsCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={cTitle} onChange={(e) => setCTitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm min-h-[110px]" value={cDescription} onChange={(e) => setCDescription(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={cPriority} onChange={(e) => setCPriority(e.target.value as TicketPriority)}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>

            {createError && <p className="text-sm text-red-600">{createError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50 cursor-pointer">
                Cancelar
              </button>
              <button
                disabled={isSaving}
                type="submit"
                className={[
                  "px-3 py-2 text-sm rounded-lg text-white",
                  isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700",
                ].join(" ")}
              >
                {isSaving ? "Salvando..." : "Criar"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
 
      {selected && mode === "view" && (
        <ModalShell title="Detalhes do Ticket" onClose={() => setMode(null)}>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500">Título</div>
              <div className="font-semibold">{selected.title}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Descrição</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{selected.description}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-4">
              <span className="inline-flex items-center gap-2">
                <UserIcon size={14} />
                {selected.clientName}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={14} />
                {selected.createdAt}
              </span>
            </div>

            <div className="text-xs text-gray-600 inline-flex items-center gap-2">
              <Wrench size={14} className="text-gray-500" />
              {selected.technicianId ? "Ticket atribuído a um técnico" : "Ticket ainda não atribuído"}
            </div>
          </div>
        </ModalShell>
      )}
 
      {selected && mode === "edit" && (
        <ModalShell title="Editar Ticket" onClose={() => setMode(null)}>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm min-h-[110px]" value={eDescription} onChange={(e) => setEDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        
              {user?.role === "TECH" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={eStatus} onChange={(e) => setEStatus(e.target.value as TicketStatus)}>
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em Progresso</option>
                    <option value="DONE">Concluído</option>
                  </select>
                </div>
              ) : (
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <div className="border rounded-lg px-3 py-2 text-sm bg-gray-50">
                    {eStatus === "OPEN" ? "Aberto" : eStatus === "IN_PROGRESS" ? "Em Progresso" : "Concluído"}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Prioridade</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={ePriority} onChange={(e) => setEPriority(e.target.value as TicketPriority)}>
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
            </div>

            {editError && <p className="text-sm text-red-600">{editError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMode(null)} className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50 cursor-pointer">
                Cancelar
              </button>
              <button
                disabled={isUpdating}
                type="submit"
                className={[
                  "px-3 py-2 text-sm rounded-lg text-white cursor-pointer",
                  isUpdating ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer",
                ].join(" ")}
              >
                {isUpdating ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
