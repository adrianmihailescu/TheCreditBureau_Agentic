import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { DemoAccount } from "../../accounts/types/demoAccount";
import type { DemoApplicationRow } from "../models/application";
import {
  createApplication,
  getDemoState,
  performApplicationAction,
  recordApplicationDecision,
  saveWorkflowLimits,
} from "../../../services/demoWorkflowApi";
import type {
  DemoActionResponse,
  DemoState,
  NewDemoApplication,
} from "../../../services/types/demoWorkflowApi";
import {
  getApplicationIssues,
  initialFlowLimits,
  type DemoFlowLimits,
} from "./workflowRules";
import type {
  DemoDecision,
  DemoWorkflowContextValue,
  WorkflowActionResult,
} from "./types/workflowContext";

const DemoWorkflowContext = createContext<DemoWorkflowContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The database request failed.";
}

function toWorkflowResult(response: DemoActionResponse): WorkflowActionResult {
  return { success: response.success, message: response.message };
}

export function DemoWorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDemoState()
      .then((loadedState) => {
        if (active) setState(loadedState);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshState(): Promise<DemoState> {
    const updatedState = await getDemoState();
    setState(updatedState);
    setLoadError(null);
    return updatedState;
  }

  async function submitApplication(
    account: DemoAccount,
    input: Omit<NewDemoApplication, "customerAccountId">,
  ): Promise<string> {
    const application = await createApplication({
      ...input,
      customerAccountId: account.id,
    });
    await refreshState();
    return application.id;
  }

  async function performAction(
    account: DemoAccount,
    applicationId: string,
    action: "route-to-bank" | "request-bureau-report" | "send-to-officer" | "prepare-bureau-report",
  ): Promise<WorkflowActionResult> {
    const result = await performApplicationAction(applicationId, action, account.id);
    await refreshState();
    return toWorkflowResult(result);
  }

  async function recordDecision(
    account: DemoAccount,
    applicationId: string,
    decision: DemoDecision,
  ): Promise<WorkflowActionResult> {
    const result = await recordApplicationDecision(applicationId, account.id, decision);
    await refreshState();
    return toWorkflowResult(result);
  }

  async function updateLimits(
    account: DemoAccount,
    nextLimits: DemoFlowLimits,
  ): Promise<void> {
    await saveWorkflowLimits(account.id, nextLimits);
    await refreshState();
  }

  function getIssues(application: DemoApplicationRow): string[] {
    return getApplicationIssues(application, state?.applications ?? [], state?.limits ?? initialFlowLimits);
  }

  return (
    <DemoWorkflowContext.Provider
      value={{
        accounts: state?.accounts ?? [],
        customers: state?.customers ?? [],
        banks: state?.banks ?? [],
        brokers: state?.brokers ?? [],
        applications: state?.applications ?? [],
        limits: state?.limits ?? initialFlowLimits,
        auditEvents: state?.auditEvents ?? [],
        isLoading,
        loadError,
        submitApplication,
        routeToBank: (account, id) => performAction(account, id, "route-to-bank"),
        requestBureauReport: (account, id) => performAction(account, id, "request-bureau-report"),
        sendToOfficer: (account, id) => performAction(account, id, "send-to-officer"),
        prepareBureauReport: (account, id) => performAction(account, id, "prepare-bureau-report"),
        recordDecision,
        updateLimits,
        getIssues,
      }}
    >
      {children}
    </DemoWorkflowContext.Provider>
  );
}

export function useDemoWorkflow(): DemoWorkflowContextValue {
  const context = useContext(DemoWorkflowContext);

  if (!context) {
    throw new Error("Demo workflow components must be rendered inside DemoWorkflowProvider.");
  }

  return context;
}
