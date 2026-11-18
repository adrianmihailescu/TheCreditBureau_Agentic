import type { DemoAccount } from "../features/accounts/demoAccounts";
import type { DemoBank } from "../features/banks/models/bank";
import type { DemoBroker } from "../features/brokers/models/broker";
import type { DemoCustomer } from "../features/customers/models/customer";
import type { DemoApplicationRow, DemoDocumentType } from "../features/applications/models/application";
import type { DemoFlowLimits } from "../features/applications/workflow/workflowRules";

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

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5250")
  .replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.detail === "string"
      ? payload.detail
      : isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : `The API request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function jsonRequest(method: "POST" | "PUT", body: unknown): RequestInit {
  return { method, body: JSON.stringify(body) };
}

export function getDemoState(): Promise<DemoState> {
  return request<DemoState>("/api/demo/state");
}

export function createApplication(
  application: NewDemoApplication,
): Promise<DemoApplicationRow> {
  return request<DemoApplicationRow>("/api/applications", jsonRequest("POST", application));
}

export function performApplicationAction(
  applicationId: string,
  action: "route-to-bank" | "request-bureau-report" | "send-to-officer" | "prepare-bureau-report",
  actorAccountId: string,
): Promise<DemoActionResponse> {
  return request<DemoActionResponse>(
    `/api/applications/${encodeURIComponent(applicationId)}/${action}`,
    jsonRequest("POST", { actorAccountId }),
  );
}

export function recordApplicationDecision(
  applicationId: string,
  actorAccountId: string,
  decision: "Approved" | "Rejected",
): Promise<DemoActionResponse> {
  return request<DemoActionResponse>(
    `/api/applications/${encodeURIComponent(applicationId)}/decision`,
    jsonRequest("POST", { actorAccountId, decision }),
  );
}

export function saveWorkflowLimits(
  actorAccountId: string,
  limits: DemoFlowLimits,
): Promise<DemoActionResponse> {
  return request<DemoActionResponse>(
    "/api/workflow/limits",
    jsonRequest("PUT", { actorAccountId, ...limits }),
  );
}
