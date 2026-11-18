import { useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { useDemoApplications } from "../../hooks/useDemoApplications";
import type { ApplicationStatus } from "./models/application";

const statuses: readonly ("All applications" | ApplicationStatus)[] = [
  "All applications",
  "In review",
  "Documents needed",
  "Awaiting officer",
  "Offer prepared",
  "Consent required",
] as const;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function ApplicationPortfolio() {
  const applications = useDemoApplications();
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof statuses)[number]>("All applications");
  const filteredApplications = applications.filter(
    ({ status }) => selectedStatus === "All applications" || status === selectedStatus,
  );
  const consentedCount = applications.filter(({ consentRecorded }) => consentRecorded).length;

  return (
    <section className="portfolio-section" aria-labelledby="portfolio-title">
      <div className="portfolio-heading">
        <div>
          <span className="section-index">03 / SAMPLE RECORDS</span>
          <h2 id="portfolio-title">Demo application portfolio</h2>
        </div>
        <span className="demo-data-tag">FICTIONAL DATA · NOT LIVE</span>
      </div>

      <div className="portfolio-stats">
        <article className="portfolio-stat">
          <span>Total applications</span>
          <strong>{applications.length}</strong>
          <small>Across {new Set(applications.map(({ bank }) => bank.id)).size} demo lenders</small>
        </article>
        <article className="portfolio-stat">
          <span>Requested credit</span>
          <strong>
            {currency.format(
              applications.reduce((total, { requestedAmount }) => total + requestedAmount, 0),
            )}
          </strong>
          <small>Illustrative amounts only</small>
        </article>
        <article className="portfolio-stat">
          <span>Consent recorded</span>
          <strong>{consentedCount} / {applications.length}</strong>
          <small>Demo record indicator; not legal evidence</small>
        </article>
      </div>

      <div className="portfolio-table-wrap">
        <div className="portfolio-table-heading">
          <h3>Recent applications</h3>
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
                <th scope="col">Application</th>
                <th scope="col">Customer</th>
                <th scope="col">Bank</th>
                <th scope="col">Product</th>
                <th scope="col">Requested</th>
                <th scope="col">Demo report</th>
                <th scope="col">Status</th>
                <th scope="col">Consent</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <strong>{application.id}</strong>
                    <small>{application.submittedAt}</small>
                  </td>
                  <td>
                    <strong>{application.customer.name}</strong>
                    <small>{application.broker.organization}</small>
                  </td>
                  <td>{application.bank.name}</td>
                  <td>{application.product}</td>
                  <td>{currency.format(application.requestedAmount)}</td>
                  <td>{application.report ? `Demo ${application.report.demoScore}` : "Not generated"}</td>
                  <td>
                    <StatusBadge status={application.status} />
                  </td>
                  <td>
                    <span className={application.consentRecorded ? "consent-yes" : "consent-no"}>
                      {application.consentRecorded ? "Recorded" : "Missing"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr><td className="empty-table" colSpan={8}>No demo applications match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="portfolio-disclaimer">
          All names, organizations, application records, and report values are fictional seed data.
          Demo credit indicators are not lending recommendations or decisions.
        </p>
      </div>
    </section>
  );
}
