import type { DemoAccount } from "../../features/accounts/types/demoAccount";
import type { DemoBank } from "../../features/banks/models/bank";
import type { DemoBroker } from "../../features/brokers/models/broker";
import type { DemoCustomer } from "../../features/customers/models/customer";
import type {
  DemoApplicationRow,
  DemoDocumentType,
} from "../../features/applications/models/application";
import type { DemoFlowLimits } from "../../features/applications/workflow/workflowRules";

export interface DemoAuditEvent {
  id: number;
  occurredAt: string;
  actorRole: DemoAccount["role"];
  applicationId: string | null;
  action: string;
}

export interface DemoState {
  customers: DemoCustomer[];
  banks: DemoBank[];
  brokers: DemoBroker[];
  accounts: DemoAccount[];
  applications: DemoApplicationRow[];
  limits: DemoFlowLimits;
  auditEvents: DemoAuditEvent[];
}

export interface NewDemoApplication {
  customerAccountId: string;
  bankId: string;
  brokerId: string;
  product: string;
  requestedAmount: number;
  consentRecorded: boolean;
  documentsProvided: DemoDocumentType[];
}

export interface DemoActionResponse {
  success: boolean;
  message: string;
  applicationId?: string;
}
