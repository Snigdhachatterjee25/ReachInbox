import { api } from "./api";
import type { CreateSenderInput, Sender } from "@/types/sender";

export const senderService = {
  async list(): Promise<Sender[]> {
    const { data } = await api.get<Sender[]>("/api/senders");
    return data;
  },

  async create(input: CreateSenderInput): Promise<Sender> {
    const { data } = await api.post<Sender>("/api/senders", input);
    return data;
  },

  async setActive(id: string, active: boolean): Promise<Sender> {
    const { data } = await api.patch<Sender>(`/api/senders/${id}`, { active });
    return data;
  },
};
