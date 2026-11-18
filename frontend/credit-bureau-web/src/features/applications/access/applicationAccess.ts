import type { DemoAccount, DemoActorRole } from "../../accounts/demoAccounts";
import type { DemoApplicationRow } from "../models/application";

export type ApplicationColumn =
  | "application"
  | "customer"
  | "bank"
  | "broker"
  | "product"
  | "amount"
  | "report"
  | "status"
  | "consent";

interface RolePolicy {
  title: string;
  description: string;
  columns: readonly ApplicationColumn[];
  showRecords: boolean;
  canSeeAmounts: boolean;
}

export interface ApplicationView {
  title: string;
  description: string;
  columns: readonly ApplicationColumn[];
  showRecords: boolean;
  canSeeAmounts: boolean;
  records: DemoApplicationRow[];
  summary: {
    applicationCount: number;
    consentCount: number;
    bankCount: number;
    reportCount: number;
    statusCount: number;
    requestedTotal: number;
  };
}

const policies = {
  Customer: {
    title: "My application",
    description: "Only applications linked to this demo customer account.",
    columns: ["application", "product", "amount", "status", "consent"],
    showRecords: true,
    canSeeAmounts: true,
  },
  Broker: {
    title: "My broker applications",
    description: "Applications assigned to this demo broker; credit report details are hidden.",
    columns: ["application", "customer", "bank", "product", "amount", "status", "consent"],
    showRecords: true,
    canSeeAmounts: true,
  },
  Bank: {
    title: "My bank applications",
    description: "Applications submitted to this demo bank; report scores are reserved for credit officers.",
    columns: ["application", "customer", "product", "amount", "status", "consent"],
    showRecords: true,
    canSeeAmounts: true,
  },
  "Credit Bureau": {
    title: "Consented report requests",
    description: "Only consented demo requests. Customer names and loan amounts are not shown.",
    columns: ["application", "product", "report", "consent"],
    showRecords: true,
    canSeeAmounts: false,
  },
  "Credit Officer": {
    title: "My review queue",
    description: "Applications for this demo bank; report indicators appear only when consent is recorded.",
    columns: ["application", "customer", "product", "amount", "report", "status", "consent"],
    showRecords: true,
    canSeeAmounts: true,
  },
  Administrator: {
    title: "Administrative overview",
    description: "Aggregate workflow counts only; customer-level application and report details are hidden.",
    columns: [],
    showRecords: false,
    canSeeAmounts: false,
  },
  "Regulator / Auditor": {
    title: "Audit overview",
    description: "Aggregate workflow and consent counts only; customer identities, amounts, and report details are hidden.",
    columns: [],
    showRecords: false,
    canSeeAmounts: false,
  },
} satisfies Record<DemoActorRole, RolePolicy>;

function isInAccountScope(account: DemoAccount, application: DemoApplicationRow): boolean {
  switch (account.role) {
    case "Customer":
      return application.customerId === account.scopeId;
    case "Broker":
      return application.brokerId === account.scopeId;
    case "Bank":
    case "Credit Officer":
      return application.bankId === account.scopeId;
    case "Credit Bureau":
      return application.consentRecorded;
    case "Administrator":
    case "Regulator / Auditor":
      return true;
  }
}

export function getApplicationView(
  account: DemoAccount,
  allApplications: DemoApplicationRow[],
): ApplicationView {
  const policy = policies[account.role];
  const inScope = allApplications.filter((application) =>
    isInAccountScope(account, application),
  );
  const records = policy.showRecords ? inScope : [];
  const summaryRecords = policy.showRecords ? inScope : allApplications;

  return {
    title: policy.title,
    description: policy.description,
    columns: policy.columns,
    showRecords: policy.showRecords,
    canSeeAmounts: policy.canSeeAmounts,
    records,
    summary: {
      applicationCount: summaryRecords.length,
      consentCount: summaryRecords.filter(({ consentRecorded }) => consentRecorded).length,
      bankCount: new Set(summaryRecords.map(({ bank }) => bank.id)).size,
      reportCount: summaryRecords.filter(({ report }) => report !== undefined).length,
      statusCount: new Set(summaryRecords.map(({ status }) => status)).size,
      requestedTotal: summaryRecords.reduce(
        (total, { requestedAmount }) => total + requestedAmount,
        0,
      ),
    },
  };
}
