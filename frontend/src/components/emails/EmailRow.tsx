import type { ScheduledEmail, SentEmail } from "@/types/email";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "@/utils/date";

export type EmailTableRow = ScheduledEmail | SentEmail;

function getTime(row: EmailTableRow): string | null {
  return "scheduledAt" in row ? row.scheduledAt : row.sentAt;
}

export function EmailRow({
  row,
  onSelect,
}: {
  row: EmailTableRow;
  onSelect: (id: string) => void;
}) {
  return (
    <tr
      className="cursor-pointer transition hover:bg-muted"
      onClick={() => onSelect(row.id)}
    >
      <td className="px-4 py-3 font-medium text-foreground">
        {row.recipient}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{row.subject}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDateTime(getTime(row))}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={row.status} />
      </td>
    </tr>
  );
}
