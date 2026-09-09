import { EmailRow, type EmailTableRow } from "./EmailRow";

interface EmailTableProps {
  rows: EmailTableRow[];
  timeColumnLabel: "Scheduled" | "Sent";
  onSelect: (id: string) => void;
}

export function EmailTable({ rows, timeColumnLabel, onSelect }: EmailTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Recipient</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">{timeColumnLabel}</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <EmailRow key={row.id} row={row} onSelect={onSelect} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
