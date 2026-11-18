import type { ApplicationStatus } from "../features/applications/models/application";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const className = `application-status status-${status.toLowerCase().replaceAll(" ", "-")}`;

  return <span className={className}>{status}</span>;
}
