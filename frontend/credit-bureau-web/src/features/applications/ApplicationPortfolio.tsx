import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import type { DemoAccount } from "../accounts/demoAccounts";
import { getApplicationView, type ApplicationColumn } from "./access/applicationAccess";
import { useDemoWorkflow } from "./workflow/DemoWorkflowContext";
import type { ApplicationStatus, DemoApplicationRow } from "./models/application";

const statuses: readonly ("All applications" | ApplicationStatus)[] = [
  "All applications",
  "Submitted",
  "Bank review",
  "Awaiting bureau report",
  "Awaiting officer",
  "Approved",
  "Rejected",
] as const;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface ApplicationPortfolioProps {
  account: DemoAccount;
}

const columnLabels: Record<ApplicationColumn, string> = {
  application: "Application",
  customer: "Customer",
  bank: "Bank",
  broker: "Broker",
  product: "Product",
  amount: "Requested",
  report: "Demo report",
  status: "Status",
  consent: "Consent",
};

export default function ApplicationPortfolio({ account }: ApplicationPortfolioProps) {
  const { applications } = useDemoWorkflow();
  const view = getApplicationView(account, applications);
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof statuses)[number]>("All applications");

  useEffect(() => {
    setSelectedStatus("All applications");
  }, [account.id]);

  const filteredApplications = view.records.filter(
    ({ status }) => selectedStatus === "All applications" || status === selectedStatus,
  );

  return (
    <section className="portfolio-section" aria-labelledby="portfolio-title">
      <div className="portfolio-heading">
        <div>
          <span className="section-index">03 / ROLE-SCOPED VIEW</span>
          <h2 id="portfolio-title">{view.title}</h2>
        </div>
        <span className="demo-data-tag">FICTIONAL DATA · NOT LIVE</span>
      </div>
      <p className="portfolio-description">{view.description}</p>

      <div className="portfolio-stats">
        <article className="portfolio-stat">
          <span>{view.showRecords ? "Applications in scope" : "Applications monitored"}</span>
          <strong>{view.summary.applicationCount}</strong>
          <small>{view.showRecords ? "Limited to this demo role" : "Aggregate count only"}</small>
        </article>
        <article className="portfolio-stat">
          <span>Consent recorded</span>
          <strong>{view.summary.consentCount} / {view.summary.applicationCount}</strong>
          <small>Demo indicator; not legal evidence</small>
        </article>
        <article className="portfolio-stat">
          <span>
            {view.canSeeAmounts
              ? "Requested credit in scope"
              : account.role === "Credit Bureau"
                ? "Demo reports available"
                : account.role === "Administrator"
                  ? "Institutions"
                  : "Status categories"}
          </span>
          <strong>
            {view.canSeeAmounts
              ? currency.format(view.summary.requestedTotal)
              : account.role === "Credit Bureau"
                ? view.summary.reportCount
                : account.role === "Administrator"
                  ? view.summary.bankCount
                  : view.summary.statusCount}
          </strong>
          <small>
            {view.canSeeAmounts
              ? "For assigned applications only"
              : account.role === "Credit Bureau"
                ? "Consent-scoped sample data"
                : "No customer-level details"}
          </small>
        </article>
      </div>

      {view.showRecords ? (
      <div className="portfolio-table-wrap">
        <div className="portfolio-table-heading">
          <h3>{view.title}</h3>
          <label className="status-filter">
            <span className="visually-hidden">Filter by application status</span>
            <select
              value={selectedStatus}
              onChange={(event) => {
                const nextStatus = statuses.find(
                  (status) => status === event.currentTarget.value,
                );
                if (nextStatus) setSelectedStatus(nextStatus);
              }}
            >
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table className="applications-table">
            <thead>
              <tr>
                {view.columns.map((column) => (
                  <th scope="col" key={column}>{columnLabels[column]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  {view.columns.map((column) => (
                    <td key={column}>
                      {renderCell(column, application)}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr>
                  <td className="empty-table" colSpan={view.columns.length}>
                    No demo applications match this role and status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="portfolio-disclaimer">
          All names, organizations, application records, and report values are fictional seed data.
          Demo role filtering is a UI convenience, not server-side authorization. Credit indicators
          are fictional and are not lending recommendations or decisions.
        </p>
      </div>
      ) : (
        <p className="portfolio-disclaimer">
          Individual application rows and credit details are not available in this role view.
          Demo role filtering is a UI convenience, not server-side authorization.
        </p>
      )}
    </section>
  );
}

function renderCell(
  column: ApplicationColumn,
  application: DemoApplicationRow,
) {
  switch (column) {
    case "application":
      return <><strong>{application.id}</strong><small>{application.submittedAt}</small></>;
    case "customer":
      return application.customer.name;
    case "bank":
      return application.bank.name;
    case "broker":
      return application.broker.organization;
    case "product":
      return application.product;
    case "amount":
      return currency.format(application.requestedAmount);
    case "report":
      if (!application.consentRecorded) return "Consent required";
      if (application.report) return `Demo ${application.report.demoScore}`;
      return application.reportPrepared ? "Prepared (demo)" : "Not available";
    case "status":
      return <StatusBadge status={application.status} />;
    case "consent":
      return (
        <span className={application.consentRecorded ? "consent-yes" : "consent-no"}>
          {application.consentRecorded ? "Recorded" : "Missing"}
        </span>
      );
  }
}
