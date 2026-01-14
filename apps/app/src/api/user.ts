import { api } from "./client";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "TECH";
}) {
  const { data } = await api.post("/users/create-user", payload);
  return data;
}
