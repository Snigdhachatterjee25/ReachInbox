import { useCallback, useEffect, useState } from "react";
import { emailService } from "@/services/email.service";
import type { Pagination, ScheduledEmail, SentEmail } from "@/types/email";

interface EmailListState<T> {
  data: T[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function useEmailList<T>(
  fetcher: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; pagination: Pagination }>,
  page: number,
  limit: number
): EmailListState<T> {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcher(page, limit)
      .then((response) => {
        if (cancelled) return;
        setData(response.data);
        setPagination(response.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load emails"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, page, limit, reloadToken]);

  return { data, pagination, loading, error, refresh };
}

export function useScheduledEmails(page: number, limit = 20) {
  return useEmailList<ScheduledEmail>(emailService.getScheduled, page, limit);
}

export function useSentEmails(page: number, limit = 20) {
  return useEmailList<SentEmail>(emailService.getSent, page, limit);
}
