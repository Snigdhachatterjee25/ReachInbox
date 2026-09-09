import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { useSenders } from "@/hooks/useSenders";
import { campaignService } from "@/services/campaign.service";
import { parseLeadsCsv } from "@/utils/csvParser";
import { toDatetimeLocalValue } from "@/utils/date";

interface ComposeEmailModalProps {
  open: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

function defaultStartTime() {
  return toDatetimeLocalValue(new Date(Date.now() + 15 * 60 * 1000));
}

export function ComposeEmailModal({
  open,
  onClose,
  onScheduled,
}: ComposeEmailModalProps) {
  const { senders, loading: sendersLoading } = useSenders();

  const [senderId, setSenderId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [delaySeconds, setDelaySeconds] = useState(1);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [leads, setLeads] = useState<string[]>([]);
  const [invalidRows, setInvalidRows] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const senderOptions = useMemo(
    () =>
      senders
        .filter((sender) => sender.active)
        .map((sender) => ({
          value: sender.id,
          label: sender.name ? `${sender.name} <${sender.email}>` : sender.email,
        })),
    [senders]
  );

  const resetForm = () => {
    setSenderId("");
    setSubject("");
    setBody("");
    setStartTime(defaultStartTime());
    setDelaySeconds(1);
    setHourlyLimit(100);
    setLeads([]);
    setInvalidRows([]);
    setFileName(null);
    setFormError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseLeadsCsv(text);
    setLeads(parsed.valid);
    setInvalidRows(parsed.invalidRows);
    setFileName(file.name);
  };

  const removeFile = () => {
    setLeads([]);
    setInvalidRows([]);
    setFileName(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!senderId) {
      setFormError("Select a sender.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setFormError("Subject and body are required.");
      return;
    }
    if (leads.length === 0) {
      setFormError("Upload a CSV with at least one valid recipient.");
      return;
    }

    const startDate = new Date(startTime);
    if (Number.isNaN(startDate.getTime()) || startDate.getTime() <= Date.now()) {
      setFormError("Start time must be in the future.");
      return;
    }

    setSubmitting(true);
    try {
      const campaign = await campaignService.create({
        subject: subject.trim(),
        body,
        startTime: startDate.toISOString(),
        delayMs: Math.max(0, Math.round(delaySeconds * 1000)),
        hourlyLimit,
        senderId,
      });

      await campaignService.scheduleRecipients(campaign.id, leads);

      onScheduled();
      handleClose();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to schedule emails. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Compose New Email"
      widthClassName="max-w-2xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          label="From"
          value={senderId}
          onChange={(e) => setSenderId(e.target.value)}
          options={senderOptions}
          placeholder={sendersLoading ? "Loading senders..." : "Select a sender"}
          disabled={sendersLoading || senderOptions.length === 0}
        />

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Write your email..."
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Leads (CSV)
          </label>
          {!fileName ? (
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
            />
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="truncate text-foreground">{fileName}</span>
              <button
                type="button"
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
          )}
          {fileName && (
            <p className="text-xs text-muted-foreground">
              {leads.length} valid lead{leads.length === 1 ? "" : "s"} found
              {invalidRows.length > 0 &&
                `, ${invalidRows.length} invalid row${invalidRows.length === 1 ? "" : "s"} ignored`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Start time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Delay between emails (sec)"
            type="number"
            min={0}
            step={0.5}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
          />
          <Input
            label="Hourly limit"
            type="number"
            min={1}
            value={hourlyLimit}
            onChange={(e) => setHourlyLimit(Number(e.target.value))}
          />
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule Emails"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
