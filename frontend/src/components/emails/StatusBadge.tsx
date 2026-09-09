import type { EmailStatus } from "@/types/email";

const STATUS_STYLES: Record<EmailStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SENT: "bg-brand-mint text-brand-mint-foreground",
  FAILED: "bg-destructive-bg text-destructive",
};

const STATUS_LABELS: Record<EmailStatus, string> = {
  SCHEDULED: "Scheduled",
  PROCESSING: "Processing",
  SENT: "Sent",
  FAILED: "Failed",
};

export function StatusBadge({ status }: { status: EmailStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
