import {
  demoApplications,
  demoBanks,
  demoBrokers,
  demoCustomers,
  demoCreditReports,
} from "../features/applications/data/mockData";
import type { DemoApplicationRow } from "../features/applications/models/application";

export function getDemoApplicationRows(): DemoApplicationRow[] {
  return demoApplications.map((application) => {
    const customer = demoCustomers.find(({ id }) => id === application.customerId);
    const bank = demoBanks.find(({ id }) => id === application.bankId);
    const broker = demoBrokers.find(({ id }) => id === application.brokerId);
    const report = demoCreditReports.find(
      ({ applicationId }) => applicationId === application.id,
    );

    if (!customer || !bank || !broker) {
      throw new Error(`Demo application ${application.id} has an invalid reference.`);
    }

    return { ...application, customer, bank, broker, report };
  });
}
