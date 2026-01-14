import { api } from "./client";


export async function login(email: string, password: string) {
  const { data } = await api.post("/users/auth", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}