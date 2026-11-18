import type { DemoBank } from "../../banks/models/bank";
import type { DemoBroker } from "../../brokers/models/broker";
import type { DemoCreditReport } from "../../credit-reports/models/creditReport";
import type { DemoCustomer } from "../../customers/models/customer";
import type { DemoApplication } from "../models/application";

export const demoCustomers = [
  { id: "CUS-1001", name: "Jordan Lee", email: "jordan.lee@example.test" },
  { id: "CUS-1002", name: "Taylor Morgan", email: "taylor.morgan@example.test" },
  { id: "CUS-1003", name: "Casey Rivera", email: "casey.rivera@example.test" },
  { id: "CUS-1004", name: "Riley Chen", email: "riley.chen@example.test" },
] satisfies DemoCustomer[];

export const demoBanks = [
  { id: "BNK-101", name: "Northstar Community Bank", type: "Community bank" },
  { id: "BNK-102", name: "Harborline Credit Union", type: "Credit union" },
  { id: "BNK-103", name: "Cedar & Stone Bank", type: "Retail bank" },
] satisfies DemoBank[];

export const demoBrokers = [
  { id: "BRK-201", name: "Avery Brooks", organization: "Bridgeway Finance" },
  { id: "BRK-202", name: "Quinn Davis", organization: "CommonGround Advisors" },
] satisfies DemoBroker[];

export const demoApplications = [
  {
    id: "APP-2026-001",
    customerId: "CUS-1001",
    bankId: "BNK-101",
    brokerId: "BRK-201",
    product: "Personal loan",
    requestedAmount: 12500,
    status: "In review",
    submittedAt: "2026-11-17",
    consentRecorded: true,
  },
  {
    id: "APP-2026-002",
    customerId: "CUS-1002",
    bankId: "BNK-102",
    brokerId: "BRK-202",
    product: "Auto loan",
    requestedAmount: 28600,
    status: "Documents needed",
    submittedAt: "2026-11-16",
    consentRecorded: true,
  },
  {
    id: "APP-2026-003",
    customerId: "CUS-1003",
    bankId: "BNK-103",
    brokerId: "BRK-201",
    product: "Small business loan",
    requestedAmount: 42000,
    status: "Awaiting officer",
    submittedAt: "2026-11-14",
    consentRecorded: true,
  },
  {
    id: "APP-2026-004",
    customerId: "CUS-1004",
    bankId: "BNK-101",
    brokerId: "BRK-202",
    product: "Personal loan",
    requestedAmount: 8000,
    status: "Consent required",
    submittedAt: "2026-11-12",
    consentRecorded: false,
  },
] satisfies DemoApplication[];

export const demoCreditReports = [
  {
    id: "RPT-DEMO-001",
    applicationId: "APP-2026-001",
    generatedAt: "2026-11-17",
    demoScore: 721,
    summary: "Fictional report; sample data only. Human review required.",
  },
  {
    id: "RPT-DEMO-002",
    applicationId: "APP-2026-002",
    generatedAt: "2026-11-16",
    demoScore: 684,
    summary: "Fictional report; sample data only. Human review required.",
  },
  {
    id: "RPT-DEMO-003",
    applicationId: "APP-2026-003",
    generatedAt: "2026-11-14",
    demoScore: 748,
    summary: "Fictional report; sample data only. Human review required.",
  },
] satisfies DemoCreditReport[];
