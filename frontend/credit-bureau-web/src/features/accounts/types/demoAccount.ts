export type DemoActorRole =
  | "Customer"
  | "Broker"
  | "Bank"
  | "Credit Bureau"
  | "Credit Officer"
  | "Administrator"
  | "Regulator / Auditor";

export interface DemoAccount {
  id: string;
  name: string;
  role: DemoActorRole;
  email: string;
  organization: string;
  action: string;
  scopeId?: string | null;
}
