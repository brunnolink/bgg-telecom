import type { TicketPriority, TicketStatus } from "../../../types/model-types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    OPEN: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    IN_PROGRESS: "bg-yellow-500/15 text-yellow-200 border border-yellow-400/30",
    DONE: "bg-slate-500/15 text-slate-200 border border-slate-400/30",
  };

  const label =
    status === "OPEN"
      ? "Aberto"
      : status === "IN_PROGRESS"
      ? "Em Progresso"
      : "Concluído";

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, string> = {
    LOW: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    MEDIUM: "bg-yellow-500/15 text-yellow-200 border border-yellow-400/30",
    HIGH: "bg-red-500/15 text-red-200 border border-red-400/30",
  };

  const label =
    priority === "LOW" ? "Baixa" : priority === "MEDIUM" ? "Média" : "Alta";

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles[priority]}`}>
      {label}
    </span>
  );
}
