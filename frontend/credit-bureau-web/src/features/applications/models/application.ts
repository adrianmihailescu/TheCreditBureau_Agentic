import type { DemoBank } from "../../banks/models/bank";
import type { DemoBroker } from "../../brokers/models/broker";
import type { DemoCreditReport } from "../../credit-reports/models/creditReport";
import type { DemoCustomer } from "../../customers/models/customer";

export type ApplicationStatus =
  | "In review"
  | "Documents needed"
  | "Awaiting officer"
  | "Offer prepared"
  | "Consent required";

export interface DemoApplication {
  id: string;
  customerId: string;
  bankId: string;
  brokerId: string;
  product: string;
  requestedAmount: number;
  status: ApplicationStatus;
  submittedAt: string;
  consentRecorded: boolean;
}

export interface DemoApplicationRow extends DemoApplication {
  customer: DemoCustomer;
  bank: DemoBank;
  broker: DemoBroker;
  report: DemoCreditReport | undefined;
}
