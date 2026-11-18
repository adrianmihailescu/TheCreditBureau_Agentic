import type { DemoApplicationRow } from "../../models/application";

export type ApplicationColumn =
  | "application"
  | "customer"
  | "bank"
  | "broker"
  | "product"
  | "amount"
  | "report"
  | "status"
  | "consent";

export interface RolePolicy {
  title: string;
  description: string;
  columns: readonly ApplicationColumn[];
  showRecords: boolean;
  canSeeAmounts: boolean;
}

export interface ApplicationView {
  title: string;
  description: string;
  columns: readonly ApplicationColumn[];
  showRecords: boolean;
  canSeeAmounts: boolean;
  records: DemoApplicationRow[];
  summary: {
    applicationCount: number;
    consentCount: number;
    bankCount: number;
    reportCount: number;
    statusCount: number;
    requestedTotal: number;
  };
}
