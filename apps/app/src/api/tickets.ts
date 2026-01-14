import type { CreateTicketPayload, Ticket, UpdateTicketPayload } from "../types";
import { api } from "./client";

export async function listTickets() {
    const { data } = await api.get<Ticket[]>("/tickets/list");
    return data;
}

export async function getTicketById(id: string) {
    const { data } = await api.get<Ticket>(`/tickets/ticket/${id}`);
    return data;
}

export async function createTicket(payload: CreateTicketPayload) {
    const { data } = await api.post("/tickets/create-ticket", payload);
    return data;
}

export async function updateTicket(id: string, payload: UpdateTicketPayload) {
    const { data } = await api.put(`/tickets/update-ticket/${id}`, payload);
    return data;
}

export async function assignTicketToMe(id: string) {
    const { data } = await api.patch(`/tickets/assign/${id}`);
    return data;
}

export async function deleteTicket(id: string) {
    const { data } = await api.delete(`/tickets/delete-ticket/${id}`);
    return data;
}