import type { DemoAccount } from "../../../accounts/types/demoAccount";
import type { DemoApplicationRow } from "../../models/application";
import type {
  DemoAuditEvent,
  DemoState,
  NewDemoApplication,
} from "../../../../services/types/demoWorkflowApi";
import type { DemoFlowLimits } from "../workflowRules";

export type DemoDecision = "Approved" | "Rejected";

export interface WorkflowActionResult {
  success: boolean;
  message: string;
}

export interface DemoWorkflowContextValue {
  accounts: DemoAccount[];
  customers: DemoState["customers"];
  banks: DemoState["banks"];
  brokers: DemoState["brokers"];
  applications: DemoApplicationRow[];
  limits: DemoFlowLimits;
  auditEvents: DemoAuditEvent[];
  isLoading: boolean;
  loadError: string | null;
  submitApplication: (
    account: DemoAccount,
    input: Omit<NewDemoApplication, "customerAccountId">,
  ) => Promise<string>;
  routeToBank: (account: DemoAccount, applicationId: string) => Promise<WorkflowActionResult>;
  requestBureauReport: (account: DemoAccount, applicationId: string) => Promise<WorkflowActionResult>;
  sendToOfficer: (account: DemoAccount, applicationId: string) => Promise<WorkflowActionResult>;
  prepareBureauReport: (account: DemoAccount, applicationId: string) => Promise<WorkflowActionResult>;
  recordDecision: (
    account: DemoAccount,
    applicationId: string,
    decision: DemoDecision,
  ) => Promise<WorkflowActionResult>;
  updateLimits: (account: DemoAccount, nextLimits: DemoFlowLimits) => Promise<void>;
  getIssues: (application: DemoApplicationRow) => string[];
}
