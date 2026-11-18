export const agentRoles = [
  {
    name: "Orchestrator Agent",
    icon: "workflow",
    description: "Coordinates application handoffs and tracks the end-to-end workflow.",
  },
  {
    name: "Customer Agent",
    icon: "users",
    description: "Guides customers through application questions and status updates.",
  },
  {
    name: "Broker Agent",
    icon: "handshake",
    description: "Matches application requirements with participating banks.",
  },
  {
    name: "Bank Agent",
    icon: "bank",
    description: "Routes application information through a bank's lending process.",
  },
  {
    name: "Bureau Agent",
    icon: "database",
    description: "Assembles an authorized credit report from bureau records.",
  },
  {
    name: "Risk Agent",
    icon: "chart",
    description: "Calculates risk indicators to support human review, never to decide alone.",
  },
  {
    name: "Compliance Agent",
    icon: "shield",
    description: "Checks that consent, policy requirements, and required documents are present.",
  },
  {
    name: "Document Agent",
    icon: "file",
    description: "Extracts information from submitted documents for human verification.",
  },
  {
    name: "Notification Agent",
    icon: "bell",
    description: "Prepares application status notifications for the relevant participants.",
  },
  {
    name: "Audit Agent",
    icon: "lock",
    description: "Records workflow events and flags items for compliance review.",
  },
] as const;
