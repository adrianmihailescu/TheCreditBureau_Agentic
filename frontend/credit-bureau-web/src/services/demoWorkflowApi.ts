import type { DemoApplicationRow } from "../features/applications/models/application";
import type { DemoFlowLimits } from "../features/applications/workflow/workflowRules";
import type {
  DemoActionResponse,
  DemoState,
  NewDemoApplication,
} from "./types/demoWorkflowApi";

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

export function recordWorkflowDecision(
  applicationId: string,
  actorAccountId: string,
  decision: "Approved" | "Rejected",
): Promise<DemoActionResponse> {
  return request<DemoActionResponse>(
    `/api/applications/${encodeURIComponent(applicationId)}/workflow-decision`,
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
