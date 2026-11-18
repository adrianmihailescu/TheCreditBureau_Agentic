import type {
  DemoApplication,
  DemoDocumentType,
  WorkflowActorRole,
} from "../models/application";

export interface DemoFlowLimits {
  maximumApplicationAmount: number;
  bankExposureCap: number;
  requireConsent: boolean;
  requiredDocuments: DemoDocumentType[];
  workflowSteps: WorkflowActorRole[];
}

export const initialFlowLimits: DemoFlowLimits = {
  maximumApplicationAmount: 50000,
  bankExposureCap: 150000,
  requireConsent: true,
  requiredDocuments: ["Proof of identity", "Proof of income"],
  workflowSteps: ["Broker", "Bank", "Credit Bureau", "Credit Officer"],
};

export function getApplicationIssues(
  application: DemoApplication,
  applications: DemoApplication[],
  limits: DemoFlowLimits,
): string[] {
  const issues: string[] = [];

  if (application.requestedAmount > limits.maximumApplicationAmount) {
    issues.push(
      `Amount exceeds the demo per-application cap of $${limits.maximumApplicationAmount.toLocaleString("en-US")}.`,
    );
  }

  const bankExposure = applications
    .filter(({ bankId, status }) => bankId === application.bankId && status !== "Rejected")
    .reduce((total, { requestedAmount }) => total + requestedAmount, 0);

  if (bankExposure > limits.bankExposureCap) {
    issues.push(
      `Bank exposure exceeds the demo cap of $${limits.bankExposureCap.toLocaleString("en-US")}.`,
    );
  }

  if (limits.requireConsent && !application.consentRecorded) {
    issues.push("Customer consent is required before this workflow can proceed.");
  }

  const missingDocuments = limits.requiredDocuments.filter(
    (document) => !application.documentsProvided.includes(document),
  );

  if (missingDocuments.length > 0) {
    issues.push(`Missing required documents: ${missingDocuments.join(", ")}.`);
  }

  return issues;
}
