import type { DemoBank } from "../../banks/models/bank";
import type { DemoBroker } from "../../brokers/models/broker";
import type { DemoCreditReport } from "../../credit-reports/models/creditReport";
import type { DemoCustomer } from "../../customers/models/customer";

export const documentTypes = [
  "Proof of identity",
  "Proof of income",
  "Business registration",
] as const;

export type DemoDocumentType = (typeof documentTypes)[number];

export const workflowActorRoles = [
  "Broker",
  "Bank",
  "Credit Bureau",
  "Credit Officer",
] as const;

export type WorkflowActorRole = (typeof workflowActorRoles)[number];

export type ApplicationStatus =
  | "Submitted"
  | "Bank review"
  | "Awaiting bureau report"
  | "Awaiting officer"
  | "Approved"
  | "Rejected";

export interface DemoApplication {
  id: string;
  customerId: string;
  bankId: string;
  brokerId: string;
  product: string;
  requestedAmount: number;
  status: ApplicationStatus;
  submittedAt: string;
  consentRecorded: boolean;
  documentsProvided: DemoDocumentType[];
  reportPrepared: boolean;
  workflowSteps: WorkflowActorRole[];
  currentWorkflowStepIndex: number;
}

export interface DemoApplicationRow extends DemoApplication {
  customer: DemoCustomer;
  bank: DemoBank;
  broker: DemoBroker;
  report: DemoCreditReport | null;
}
