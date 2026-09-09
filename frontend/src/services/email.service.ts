import { api } from "./api";
import type {
  EmailDetail,
  PaginatedResponse,
  ScheduledEmail,
  SentEmail,
} from "@/types/email";

export const emailService = {
  async getScheduled(
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ScheduledEmail>> {
    const { data } = await api.get<PaginatedResponse<ScheduledEmail>>(
      "/api/emails/scheduled",
      { params: { page, limit } }
    );
    return data;
  },

  async getSent(page = 1, limit = 20): Promise<PaginatedResponse<SentEmail>> {
    const { data } = await api.get<PaginatedResponse<SentEmail>>(
      "/api/emails/sent",
      { params: { page, limit } }
    );
    return data;
  },

  async getById(id: string): Promise<EmailDetail> {
    const { data } = await api.get<EmailDetail>(`/api/emails/${id}`);
    return data;
  },
};
