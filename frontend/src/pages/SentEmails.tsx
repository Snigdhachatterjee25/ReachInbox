import { useState } from "react";
import { RotateCw, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmailTable } from "@/components/emails/EmailTable";
import { EmailDetailsModal } from "@/components/emails/EmailDetailsModal";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useSentEmails } from "@/hooks/useEmails";
import { useDebounce } from "@/hooks/useDebounce";

export default function SentEmails() {
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const { data, loading, error, refresh } = useSentEmails(page);

  const query = debouncedSearch.trim().toLowerCase();
  const filtered = query
    ? data.filter(
        (email) =>
          email.recipient.toLowerCase().includes(query) ||
          email.subject.toLowerCase().includes(query)
      )
    : data;

  return (
    <div className="flex h-full flex-col">
      <Header title="Sent Emails" />

      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sent emails..."
            className="w-full pl-9"
          />
        </div>
        <Button variant="secondary" onClick={refresh} aria-label="Refresh">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && <LoadingState label="Loading sent emails..." />}
        {!loading && error && <ErrorState message={error} onRetry={refresh} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No sent emails yet"
            description="Emails will appear here once they're delivered."
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <EmailTable
            rows={filtered}
            timeColumnLabel="Sent"
            onSelect={setSelectedEmailId}
          />
        )}
      </div>

      <EmailDetailsModal
        emailId={selectedEmailId}
        onClose={() => setSelectedEmailId(null)}
      />
    </div>
  );
}
