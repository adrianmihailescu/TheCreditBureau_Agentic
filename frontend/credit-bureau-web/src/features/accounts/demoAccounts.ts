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
}

export const demoAccounts = [
  {
    id: "demo-customer",
    name: "Demo Customer",
    role: "Customer",
    email: "jordan.lee@example.test",
    organization: "Individual applicant",
    action: "Start application",
  },
  {
    id: "demo-broker",
    name: "Demo Broker",
    role: "Broker",
    email: "avery.brooks@example.test",
    organization: "Bridgeway Finance",
    action: "Submit to a bank",
  },
  {
    id: "demo-bank",
    name: "demo bank",
    role: "Bank",
    email: "morgan.ellis@northstar.example.test",
    organization: "Northstar Community Bank",
    action: "Start bank review",
  },
  {
    id: "demo-bureau",
    name: "demo bureau",
    role: "Credit Bureau",
    email: "jamie.park@bureau.example.test",
    organization: "The Credit Bureau",
    action: "Prepare demo report",
  },
  {
    id: "demo-credit-officer",
    name: "demo credit officer",
    role: "Credit Officer",
    email: "dana.scott@northstar.example.test",
    organization: "Northstar Community Bank",
    action: "Start officer review",
  },
  {
    id: "demo-administrator",
    name: "demo administrator",
    role: "Administrator",
    email: "sam.taylor@example.test",
    organization: "Platform administration",
    action: "Run workflow demo",
  },
  {
    id: "demo-auditor",
    name: "demo auditor",
    role: "Regulator / Auditor",
    email: "alex.morgan@oversight.example.test",
    organization: "Oversight team",
    action: "Start audit review",
  },
] satisfies DemoAccount[];
