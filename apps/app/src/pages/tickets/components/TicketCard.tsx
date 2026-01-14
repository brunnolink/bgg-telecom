import { Clock3, Eye, Pencil, Trash2, User as UserIcon, Wrench } from "lucide-react";
import type { Ticket } from "../../../types/model-types";
import { formatDateBR } from "../utils";
import { PriorityBadge, StatusBadge } from "./Badges";

export function TicketCard({
  ticket,
  canAssume,
  onAssume,
  onView,
  onEdit,
  onDelete,
}: {
  ticket: Ticket;
  canAssume: boolean;
  onAssume: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={[
        "bg-white border rounded-xl p-4",
        "transition-all duration-200",
        "hover:shadow-md hover:-translate-y-[1px] hover:border-blue-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-base truncate">{ticket.title}</h2>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {ticket.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
            <span className="inline-flex items-center gap-2">
              <UserIcon size={14} />
              {ticket.clientName}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3 size={14} />
              {formatDateBR(ticket.createdAt)}
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
        {canAssume && (
          <button
            onClick={onAssume}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            title="Assumir ticket"
          >
            Assumir
          </button>
        )}

        <button
          onClick={onView}
          className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition cursor-pointer"
          title="Ver"
        >
          <Eye size={18} />
        </button>

        <button
          onClick={onEdit}
          className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition cursor-pointer"
          title="Editar"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={onDelete}
          className="p-2 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition cursor-pointer"
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
