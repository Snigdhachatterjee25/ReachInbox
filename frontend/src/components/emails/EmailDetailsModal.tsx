import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "@/utils/date";
import { emailService } from "@/services/email.service";
import type { EmailDetail } from "@/types/email";

interface EmailDetailsModalProps {
  emailId: string | null;
  onClose: () => void;
}

export function EmailDetailsModal({
  emailId,
  onClose,
}: EmailDetailsModalProps) {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emailId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setEmail(null);

    emailService
      .getById(emailId)
      .then((data) => {
        if (!cancelled) setEmail(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load email"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [emailId]);

  return (
    <Modal open={emailId !== null} onClose={onClose} title="Email details">
      {loading && <LoadingState label="Loading email..." />}
      {error && <ErrorState message={error} />}
      {email && !loading && !error && (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={email.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium text-foreground">
              {email.recipient}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subject</span>
            <span className="font-medium text-foreground">
              {email.subject}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Scheduled at</span>
            <span className="text-foreground">
              {formatDateTime(email.scheduledAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sent at</span>
            <span className="text-foreground">
              {formatDateTime(email.sentAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Attempts</span>
            <span className="text-foreground">{email.attempts}</span>
          </div>
          <div>
            <p className="mb-1 text-muted-foreground">Body</p>
            <p className="rounded-lg bg-muted p-3 whitespace-pre-wrap text-foreground">
              {email.body}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
