import { api } from "./api";
import type { Campaign, CreateCampaignInput } from "@/types/campaign";

/**
 * Bulk CSV scheduling flow: create the campaign, then hand it the
 * recipient list. Kept as two isolated calls so either endpoint can be
 * wired up on the backend independently.
 */
export const campaignService = {
  async create(input: CreateCampaignInput): Promise<Campaign> {
    const { data } = await api.post<Campaign>("/api/campaigns", input);
    return data;
  },

  async list(): Promise<Campaign[]> {
    const { data } = await api.get<Campaign[]>("/api/campaigns");
    return data;
  },

  async get(id: string): Promise<Campaign> {
    const { data } = await api.get<Campaign>(`/api/campaigns/${id}`);
    return data;
  },

  async scheduleRecipients(id: string, recipients: string[]): Promise<void> {
    await api.post(`/api/campaigns/${id}/schedule`, { recipients });
  },
};
