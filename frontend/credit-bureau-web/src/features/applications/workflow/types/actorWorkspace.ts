import type { ReactNode } from "react";
import type { DemoAccount } from "../../../accounts/types/demoAccount";
import type { DemoApplicationRow } from "../../models/application";

export interface ActorWorkspaceProps {
  account: DemoAccount;
}

export interface WorkflowRecordProps {
  application: DemoApplicationRow;
  details: string;
  issues: string[];
  action?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  actions?: ReactNode;
  showCustomer?: boolean;
}
