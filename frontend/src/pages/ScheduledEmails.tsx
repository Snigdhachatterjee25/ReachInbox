import { useState } from "react";
import { Plus, RotateCw, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmailTable } from "@/components/emails/EmailTable";
import { EmailDetailsModal } from "@/components/emails/EmailDetailsModal";
import { ComposeEmailModal } from "@/components/emails/ComposeEmailModal";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useScheduledEmails } from "@/hooks/useEmails";
import { useDebounce } from "@/hooks/useDebounce";

export default function ScheduledEmails() {
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const { data, loading, error, refresh } = useScheduledEmails(page);

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
      <Header title="Scheduled Emails" />

      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scheduled emails..."
            className="w-full pl-9"
          />
        </div>
        <Button variant="secondary" onClick={refresh} aria-label="Refresh">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button onClick={() => setComposeOpen(true)}>
          <Plus className="h-4 w-4" />
          Compose
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && <LoadingState label="Loading scheduled emails..." />}
        {!loading && error && <ErrorState message={error} onRetry={refresh} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No scheduled emails"
            description="Compose a new email to schedule your first campaign."
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <EmailTable
            rows={filtered}
            timeColumnLabel="Scheduled"
            onSelect={setSelectedEmailId}
          />
        )}
      </div>

      <EmailDetailsModal
        emailId={selectedEmailId}
        onClose={() => setSelectedEmailId(null)}
      />
      <ComposeEmailModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onScheduled={refresh}
      />
    </div>
  );
}
