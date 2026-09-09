import { api } from "./api";
import type { EmailStatus } from "@/types/email";

export interface EmailSearchResult {
  id: string;
  recipient: string;
  subject: string;
  status: EmailStatus;
  scheduledAt?: string;
  sentAt?: string | null;
}

export const searchService = {
  async searchEmails(
    q: string,
    status?: EmailStatus
  ): Promise<EmailSearchResult[]> {
    const { data } = await api.get<EmailSearchResult[]>("/api/search/emails", {
      params: { q, status },
    });
    return data;
  },
};
