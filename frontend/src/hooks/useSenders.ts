import { useCallback, useEffect, useState } from "react";
import { senderService } from "@/services/sender.service";
import type { Sender } from "@/types/sender";

export function useSenders() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await senderService.list();
      setSenders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load senders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { senders, loading, error, refresh };
}
