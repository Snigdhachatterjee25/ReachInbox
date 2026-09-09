export type EmailStatus = "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED";

export interface ScheduledEmail {
  id: string;
  recipient: string;
  subject: string;
  scheduledAt: string;
  status: EmailStatus;
}

export interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  sentAt: string | null;
  status: EmailStatus;
}

export interface EmailDetail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status: EmailStatus;
  attempts: number;
  messageId?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
