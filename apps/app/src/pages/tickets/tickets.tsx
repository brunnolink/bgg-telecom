import { Search, User as UserIcon, Clock3, Wrench } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTicketToMe,
} from "../../api/tickets";
import { Topbar } from "../../components/Topbar";
import { useAuth } from "../../contexts/AuthContext";
import type { Ticket, TicketStatus, TicketPriority } from "../../types";
import { StatusBadge, PriorityBadge } from "./components/Badges";
import { ModalShell } from "./components/ModalShell";
import { TicketCard } from "./components/TicketCard";
import { formatDateBR } from "./utils";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-xl px-4 py-3 flex items-baseline justify-between backdrop-blur">
      <div className="text-sm text-slate-100">{label}</div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

export function Tickets() {
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const LIMIT = 5;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TicketPriority>(
    "ALL"
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cDescription, setCDescription] = useState("");
  const [cPriority, setCPriority] = useState<TicketPriority>("MEDIUM");
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      const data = await listTickets({
        page,
        limit: LIMIT,
      });

      setTickets(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : t.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ? true : t.priority === priorityFilter;

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

  function handleDelete(ticket: Ticket) {
    setDeleteTarget(ticket);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteTicket(deleteTarget.id);
      setDeleteTarget(null);
      await loadTickets();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Erro ao excluir ticket");
    } finally {
      setIsDeleting(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="max-w-6xl mx-auto px-4 py-6 text-slate-200">
          Carregando tickets...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="max-w-6xl mx-auto px-4 py-6 text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
      <div className="absolute -top-40 -left-40 h-105 w-105 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-105 w-105 rounded-full bg-cyan-500/10 blur-3xl" />

      <Topbar />

      <div className="relative max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold leading-tight text-white">
              Olá, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm text-slate-300">
              Acompanhe seus tickets de suporte
            </p>
          </div>

          <button
            onClick={openCreate}
            className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-lg shadow-blue-600/20"
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
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 backdrop-blur">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                placeholder="Buscar tickets..."
                className="w-full rounded-lg pl-10 pr-3 py-2 text-sm bg-slate-950/60 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="rounded-lg px-3 py-2 text-sm md:w-44 bg-slate-950/60 border border-white/10 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">Todos os status</option>
              <option value="OPEN">Aberto</option>
              <option value="IN_PROGRESS">Em Progresso</option>
              <option value="DONE">Concluído</option>
            </select>

            <select
              className="rounded-lg px-3 py-2 text-sm md:w-44 bg-slate-950/60 border border-white/10 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/40"
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

        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const canAssume =
              user?.role === "TECH" &&
              !ticket.technicianId &&
              ticket.status === "OPEN";

            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                canAssume={!!canAssume}
                onAssume={() => handleAssign(ticket)}
                onView={() => openView(ticket)}
                onEdit={() => openEdit(ticket)}
                onDelete={() => handleDelete(ticket)}
              />
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="text-sm text-slate-300 bg-slate-900/60 border border-white/10 rounded-xl p-4 backdrop-blur">
              Nenhum ticket encontrado.
            </div>
          )}
        </div>

        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm text-white bg-slate-900/60 hover:bg-slate-900/90 disabled:opacity-50 cursor-pointer backdrop-blur"
          >
            Anterior
          </button>

          <span className="text-sm text-slate-300">Página {page}</span>

          <button
            disabled={tickets.length < LIMIT}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm text-white bg-slate-900/60 hover:bg-slate-900/90 disabled:opacity-50 cursor-pointer backdrop-blur"
          >
            Próxima
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <ModalShell title="Novo Ticket" onClose={() => setIsCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-200">
                Título
              </label>
              <input
                className="w-full border border-white/10 bg-slate-950/70 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                value={cTitle}
                onChange={(e) => setCTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-200">
                Descrição
              </label>
              <textarea
                className="w-full border border-white/10 bg-slate-950/70 text-white rounded-lg px-3 py-2 text-sm min-h-[110px] focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                value={cDescription}
                onChange={(e) => setCDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-200">
                Prioridade
              </label>
              <select
                className="w-full border border-white/10 bg-slate-950/70 text-white rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                value={cPriority}
                onChange={(e) => setCPriority(e.target.value as TicketPriority)}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>

            {createError && (
              <p className="text-sm text-red-300">{createError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-slate-900/60 text-white hover:bg-slate-900/90 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isSaving}
                type="submit"
                className={[
                  "px-3 py-2 text-sm rounded-lg text-white cursor-pointer",
                  isSaving
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700",
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
              <div className="text-xs text-slate-400">Título</div>
              <div className="font-semibold text-white">{selected.title}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Descrição</div>
              <div className="text-sm text-slate-200 whitespace-pre-wrap">
                {selected.description}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span className="inline-flex items-center gap-2">
                <UserIcon size={14} /> {selected.clientName}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={14} /> {formatDateBR(selected.createdAt)}
              </span>
            </div>

            <div className="text-xs text-slate-300 inline-flex items-center gap-2">
              <Wrench size={14} className="text-slate-400" />
              {selected.technicianId
                ? "Ticket atribuído a um técnico"
                : "Ticket ainda não atribuído"}
            </div>
          </div>
        </ModalShell>
      )}

      {selected && mode === "edit" && (
        <ModalShell title="Editar Ticket" onClose={() => setMode(null)}>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-200">
                Título
              </label>
              <input
                className="w-full border border-white/10 bg-slate-950/70 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                value={eTitle}
                onChange={(e) => setETitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-200">
                Descrição
              </label>
              <textarea
                className="w-full border border-white/10 bg-slate-950/70 text-white rounded-lg px-3 py-2 text-sm min-h-[110px] focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                value={eDescription}
                onChange={(e) => setEDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {user?.role === "TECH" ? (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-200">
                    Status
                  </label>
                  <select
                    className="w-full border border-white/10 bg-slate-950/70 text-white rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                    value={eStatus}
                    onChange={(e) => setEStatus(e.target.value as TicketStatus)}
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em Progresso</option>
                    <option value="DONE">Concluído</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-200">
                    Status
                  </label>
                  <div className="border border-white/10 rounded-lg px-3 py-2 text-sm bg-slate-950/70 text-white">
                    {eStatus === "OPEN"
                      ? "Aberto"
                      : eStatus === "IN_PROGRESS"
                      ? "Em Progresso"
                      : "Concluído"}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-200">
                  Prioridade
                </label>
                <select
                  className="w-full border border-white/10 bg-slate-950/70 text-white rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                  value={ePriority}
                  onChange={(e) =>
                    setEPriority(e.target.value as TicketPriority)
                  }
                >
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
            </div>

            {editError && <p className="text-sm text-red-300">{editError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode(null)}
                className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-slate-900/60 text-white hover:bg-slate-900/90 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isUpdating}
                type="submit"
                className={[
                  "px-3 py-2 text-sm rounded-lg text-white cursor-pointer",
                  isUpdating
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700",
                ].join(" ")}
              >
                {isUpdating ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {deleteTarget && (
        <ModalShell
          title="Excluir Ticket"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-200">
              Tem certeza que deseja excluir o ticket:
            </p>

            <div className="bg-slate-900/60 border border-white/10 rounded-lg p-3 text-white">
              <strong>{deleteTarget.title}</strong>
            </div>

            <p className="text-sm text-red-300">
              Essa ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-slate-900/60 text-white hover:bg-slate-900/90"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={[
                  "px-3 py-2 text-sm rounded-lg text-white cursor-pointer",
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700",
                ].join(" ")}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
