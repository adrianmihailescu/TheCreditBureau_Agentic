import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { DemoAccount } from "../../accounts/demoAccounts";
import type {
  DemoApplicationRow,
  DemoDocumentType,
} from "../models/application";
import { documentTypes } from "../models/application";
import { getApplicationView } from "../access/applicationAccess";
import { useDemoWorkflow, type DemoDecision, type WorkflowActionResult } from "./DemoWorkflowContext";
import type { DemoFlowLimits } from "./workflowRules";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The database request failed.";
}

async function reportAction(
  action: Promise<WorkflowActionResult>,
  setMessage: (message: string) => void,
): Promise<void> {
  try {
    const result = await action;
    setMessage(result.message);
  } catch (error) {
    setMessage(getErrorMessage(error));
  }
}

interface ActorWorkspaceProps {
  account: DemoAccount;
}

export default function ActorWorkspace({ account }: ActorWorkspaceProps) {
  const workflow = useDemoWorkflow();
  const scopedRows = getApplicationView(account, workflow.applications).records;

  return (
    <section className="actor-workspace" aria-labelledby="workspace-title">
      <div className="workspace-heading">
        <div>
          <span className="section-index">YOUR WORKSPACE</span>
          <h2 id="workspace-title">{account.role} actions</h2>
        </div>
        <span className="workspace-demo-badge">SQL SERVER · PERSISTED</span>
      </div>

      {account.role === "Customer" && (
        <CustomerWorkspace account={account} />
      )}
      {account.role === "Broker" && (
        <BrokerWorkspace applications={scopedRows} account={account} />
      )}
      {account.role === "Bank" && (
        <BankWorkspace applications={scopedRows} account={account} />
      )}
      {account.role === "Credit Bureau" && (
        <BureauWorkspace applications={scopedRows} account={account} />
      )}
      {account.role === "Credit Officer" && (
        <CreditOfficerWorkspace applications={scopedRows} account={account} />
      )}
      {account.role === "Administrator" && (
        <AdministratorWorkspace account={account} />
      )}
      {account.role === "Regulator / Auditor" && (
        <AuditorWorkspace />
      )}
    </section>
  );
}

function CustomerWorkspace({ account }: { account: DemoAccount }) {
  const { submitApplication, limits, banks, brokers, accounts } = useDemoWorkflow();
  const availableBanks = banks.filter((bank) =>
    accounts.some(({ role, scopeId }) => role === "Bank" && scopeId === bank.id),
  );
  const availableBrokers = brokers.filter((broker) =>
    accounts.some(({ role, scopeId }) => role === "Broker" && scopeId === broker.id),
  );
  const [bankId, setBankId] = useState(availableBanks[0]?.id ?? "");
  const [brokerId, setBrokerId] = useState(availableBrokers[0]?.id ?? "");
  const [product, setProduct] = useState("Personal loan");
  const [amount, setAmount] = useState("12000");
  const [consentRecorded, setConsentRecorded] = useState(false);
  const [documentsProvided, setDocumentsProvided] = useState<DemoDocumentType[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleDocument(document: DemoDocumentType) {
    setDocumentsProvided((current) =>
      current.includes(document)
        ? current.filter((item) => item !== document)
        : [...current, document],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const applicationId = await submitApplication(account, {
        bankId,
        brokerId,
        product,
        requestedAmount: Number(amount),
        consentRecorded,
        documentsProvided,
      });
      setMessage(`Application ${applicationId} submitted to your broker's queue.`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-heading">
        <div>
          <h3>Apply for credit</h3>
          <p>Submit a demo application. Missing requirements block handoffs but never auto-reject.</p>
        </div>
        <span className="workspace-limit">
          Demo amount cap: {money.format(limits.maximumApplicationAmount)}
        </span>
      </div>
      <form className="workflow-form" onSubmit={handleSubmit}>
        <label>
          Credit product
          <select value={product} onChange={(event) => setProduct(event.currentTarget.value)}>
            <option>Personal loan</option>
            <option>Auto loan</option>
            <option>Small business loan</option>
          </select>
        </label>
        <label>
          Requested amount
          <input
            type="number"
            min="1"
            step="100"
            required
            value={amount}
            onChange={(event) => setAmount(event.currentTarget.value)}
          />
        </label>
        <label>
          Participating bank
          <select required value={bankId} onChange={(event) => setBankId(event.currentTarget.value)}>
            {availableBanks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
          </select>
        </label>
        <label>
          Broker
          <select required value={brokerId} onChange={(event) => setBrokerId(event.currentTarget.value)}>
            {availableBrokers.map((broker) => (
              <option key={broker.id} value={broker.id}>{broker.organization}</option>
            ))}
          </select>
        </label>
        <fieldset className="workflow-choice-group">
          <legend>Documents provided</legend>
          {documentTypes.map((document) => (
            <label className="workflow-check" key={document}>
              <input
                type="checkbox"
                checked={documentsProvided.includes(document)}
                onChange={() => toggleDocument(document)}
              />
              {document}
            </label>
          ))}
        </fieldset>
        <label className="workflow-check workflow-consent">
          <input
            type="checkbox"
            checked={consentRecorded}
            onChange={(event) => setConsentRecorded(event.currentTarget.checked)}
          />
          I consent to the fictional demo bureau inquiry for this application.
        </label>
        <p className="workflow-hint">
          Required documents: {limits.requiredDocuments.length
            ? limits.requiredDocuments.join(", ")
            : "None configured"}
          {limits.requireConsent ? " · Consent is required to continue." : ""}
        </p>
        <div className="workflow-form-actions">
          <button className="workflow-primary-button" type="submit" disabled={submitting}>
            {submitting ? "Saving application…" : "Submit application"}
          </button>
          {message && <span className="workflow-feedback" role="status">{message}</span>}
        </div>
      </form>
    </div>
  );
}

function BrokerWorkspace({
  applications,
  account,
}: {
  applications: DemoApplicationRow[];
  account: DemoAccount;
}) {
  const { routeToBank, getIssues, limits } = useDemoWorkflow();
  const [message, setMessage] = useState("");

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-heading">
        <div>
          <h3>Broker submission queue</h3>
          <p>Route eligible customer applications to their selected bank.</p>
        </div>
        <span className="workspace-limit">Per-bank cap: {money.format(limits.bankExposureCap)}</span>
      </div>
      <div className="workspace-record-list">
        {applications.map((application) => {
          const issues = getIssues(application);
          const canRoute = application.status === "Submitted" && issues.length === 0;
          return (
            <WorkflowRecord
              key={application.id}
              application={application}
              details={`${application.customer.name} · ${application.bank.name} · ${money.format(application.requestedAmount)}`}
              issues={issues}
              action={application.status === "Submitted" ? "Submit to bank" : undefined}
              actionDisabled={!canRoute}
              onAction={() => { void reportAction(routeToBank(account, application.id), setMessage); }}
            />
          );
        })}
        {applications.length === 0 && <EmptyWorkspace>No applications are assigned to this broker.</EmptyWorkspace>}
      </div>
      {message && <p className="workflow-feedback" role="status">{message}</p>}
    </div>
  );
}

function BankWorkspace({
  applications,
  account,
}: {
  applications: DemoApplicationRow[];
  account: DemoAccount;
}) {
  const { requestBureauReport, sendToOfficer, getIssues, limits } = useDemoWorkflow();
  const [message, setMessage] = useState("");

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-heading">
        <div>
          <h3>Bank intake and review</h3>
          <p>Check configured limits and prerequisites before handing off to the bureau or officer.</p>
        </div>
        <span className="workspace-limit">Max per application: {money.format(limits.maximumApplicationAmount)}</span>
      </div>
      <div className="workspace-record-list">
        {applications.map((application) => {
          const issues = getIssues(application);
          const canAct = application.status === "Bank review" && issues.length === 0;
          return (
            <WorkflowRecord
              key={application.id}
              application={application}
              details={`${application.customer.name} · ${application.product} · ${money.format(application.requestedAmount)}`}
              issues={issues}
              action={application.status === "Bank review"
                ? application.consentRecorded && !application.reportPrepared
                  ? "Request bureau report"
                  : "Send to Credit Officer"
                : undefined}
              actionDisabled={!canAct}
              onAction={() => {
                const action = application.consentRecorded && !application.reportPrepared
                  ? requestBureauReport(account, application.id)
                  : sendToOfficer(account, application.id);
                void reportAction(action, setMessage);
              }}
            />
          );
        })}
        {applications.length === 0 && <EmptyWorkspace>No applications are assigned to this bank.</EmptyWorkspace>}
      </div>
      {message && <p className="workflow-feedback" role="status">{message}</p>}
    </div>
  );
}

function BureauWorkspace({
  applications,
  account,
}: {
  applications: DemoApplicationRow[];
  account: DemoAccount;
}) {
  const { prepareBureauReport, getIssues } = useDemoWorkflow();
  const [message, setMessage] = useState("");

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-heading">
        <div>
          <h3>Consented bureau requests</h3>
          <p>Only consented applications are listed; this demo does not connect to a real bureau.</p>
        </div>
      </div>
      <div className="workspace-record-list">
        {applications
          .filter(({ status }) => status === "Awaiting bureau report")
          .map((application) => {
            const issues = getIssues(application);
            return (
              <WorkflowRecord
                key={application.id}
                application={application}
                details={`${application.product} · Consent recorded`}
                issues={issues}
                action="Prepare fictional report"
                actionDisabled={issues.length > 0}
                onAction={() => {
                  void reportAction(prepareBureauReport(account, application.id), setMessage);
                }}
                showCustomer={false}
              />
            );
          })}
        {!applications.some(({ status }) => status === "Awaiting bureau report") && (
          <EmptyWorkspace>No consented applications are waiting for a bureau report.</EmptyWorkspace>
        )}
      </div>
      {message && <p className="workflow-feedback" role="status">{message}</p>}
    </div>
  );
}

function CreditOfficerWorkspace({
  applications,
  account,
}: {
  applications: DemoApplicationRow[];
  account: DemoAccount;
}) {
  const { recordDecision, getIssues } = useDemoWorkflow();
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState("");
  const reviewQueue = applications.filter(({ status }) => status === "Awaiting officer");

  async function decide(applicationId: string, decision: DemoDecision) {
    try {
      const result = await recordDecision(account, applicationId, decision);
      setMessage(result.message);
      if (result.success) setAcknowledged(false);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-heading">
        <div>
          <h3>Credit Officer decision queue</h3>
          <p>Final decisions are manual. No score, agent, or limit automatically approves or rejects.</p>
        </div>
      </div>
      <label className="workflow-check decision-acknowledgement">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.currentTarget.checked)}
        />
        I am recording a human-reviewed demo decision as the Credit Officer.
      </label>
      <div className="workspace-record-list">
        {reviewQueue.map((application) => {
          const issues = getIssues(application);
          return (
            <WorkflowRecord
              key={application.id}
              application={application}
              details={`${application.customer.name} · ${application.product} · ${money.format(application.requestedAmount)} · ${application.report ? `Demo report ${application.report.demoScore}` : application.reportPrepared ? "Demo report prepared" : "No report"}`}
              issues={issues}
              actions={(
                <div className="decision-actions">
                  <button
                    className="workflow-primary-button"
                    type="button"
                    disabled={!acknowledged || issues.length > 0}
                    onClick={() => decide(application.id, "Approved")}
                  >
                    Record demo approval
                  </button>
                  <button
                    className="workflow-secondary-button"
                    type="button"
                    disabled={!acknowledged || issues.length > 0}
                    onClick={() => decide(application.id, "Rejected")}
                  >
                    Record demo rejection
                  </button>
                </div>
              )}
            />
          );
        })}
        {reviewQueue.length === 0 && <EmptyWorkspace>No applications are awaiting this officer.</EmptyWorkspace>}
      </div>
      {message && <p className="workflow-feedback" role="status">{message}</p>}
    </div>
  );
}

function AdministratorWorkspace({ account }: { account: DemoAccount }) {
  const { limits, updateLimits, applications, banks } = useDemoWorkflow();
  const [formLimits, setFormLimits] = useState<DemoFlowLimits>(limits);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFormLimits(limits);
  }, [limits]);

  function toggleRequiredDocument(document: DemoDocumentType) {
    setFormLimits((current) => ({
      ...current,
      requiredDocuments: current.requiredDocuments.includes(document)
        ? current.requiredDocuments.filter((item) => item !== document)
        : [...current.requiredDocuments, document],
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateLimits(account, formLimits);
      setMessage("Demo workflow limits saved to SQL Server.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save demo limits.");
    }
  }

  const bankExposure = banks.map((bank) => ({
    ...bank,
    exposure: applications
      .filter((application) => application.bankId === bank.id && application.status !== "Rejected")
      .reduce((total, application) => total + application.requestedAmount, 0),
  }));

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-heading">
        <div>
          <h3>Workflow limits and requirements</h3>
          <p>Limits flag or block handoffs; they never automatically approve or reject an application.</p>
        </div>
      </div>
      <form className="workflow-form admin-limit-form" onSubmit={handleSave}>
        <label>
          Maximum per application
          <input
            type="number"
            min="1"
            required
            value={formLimits.maximumApplicationAmount}
            onChange={(event) => setFormLimits({
              ...formLimits,
              maximumApplicationAmount: Number(event.currentTarget.value),
            })}
          />
        </label>
        <label>
          Maximum exposure per bank
          <input
            type="number"
            min="1"
            required
            value={formLimits.bankExposureCap}
            onChange={(event) => setFormLimits({
              ...formLimits,
              bankExposureCap: Number(event.currentTarget.value),
            })}
          />
        </label>
        <fieldset className="workflow-choice-group">
          <legend>Required documents</legend>
          {documentTypes.map((document) => (
            <label className="workflow-check" key={document}>
              <input
                type="checkbox"
                checked={formLimits.requiredDocuments.includes(document)}
                onChange={() => toggleRequiredDocument(document)}
              />
              {document}
            </label>
          ))}
        </fieldset>
        <label className="workflow-check workflow-consent">
          <input
            type="checkbox"
            checked={formLimits.requireConsent}
            onChange={(event) => setFormLimits({
              ...formLimits,
              requireConsent: event.currentTarget.checked,
            })}
          />
          Require consent before workflow handoffs
        </label>
        <div className="workflow-form-actions">
          <button className="workflow-primary-button" type="submit">Save demo limits</button>
          {message && <span className="workflow-feedback" role="status">{message}</span>}
        </div>
      </form>
      <div className="exposure-summary">
        <h4>Current requested exposure by bank</h4>
        {bankExposure.map((bank) => (
          <div className="exposure-row" key={bank.id}>
            <span>{bank.name}</span>
            <strong>{money.format(bank.exposure)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditorWorkspace() {
  const { auditEvents } = useDemoWorkflow();

  return (
    <div className="workspace-panel">
      <div className="workspace-panel-heading">
        <div>
          <h3>Workflow audit trail</h3>
          <p>Loaded from SQL Server; includes role and application reference only, without names or amounts.</p>
        </div>
      </div>
      <div className="audit-event-list">
        {auditEvents.map((event) => (
          <article className="audit-event" key={event.id}>
            <time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString()}</time>
            <strong>{event.action}</strong>
            <span>{event.actorRole}{event.applicationId ? ` · ${event.applicationId}` : ""}</span>
          </article>
        ))}
        {auditEvents.length === 0 && (
          <EmptyWorkspace>No demo workflow events have been recorded in this session.</EmptyWorkspace>
        )}
      </div>
    </div>
  );
}

interface WorkflowRecordProps {
  application: DemoApplicationRow;
  details: string;
  issues: string[];
  action?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  actions?: ReactNode;
  showCustomer?: boolean;
}

function WorkflowRecord({
  application,
  details,
  issues,
  action,
  actionDisabled = false,
  onAction,
  actions,
  showCustomer = true,
}: WorkflowRecordProps) {
  return (
    <article className="workflow-record">
      <div className="workflow-record-main">
        <div className="workflow-record-title">
          <strong>{application.id}</strong>
          <span className="record-status">{application.status}</span>
        </div>
        <p>{details}</p>
        {showCustomer && <small>{application.bank.name}</small>}
      </div>
      {issues.length > 0 && (
        <ul className="workflow-issues">
          {issues.map((issue) => <li key={issue}>{issue}</li>)}
        </ul>
      )}
      {action && (
        <button
          className="workflow-primary-button"
          type="button"
          disabled={actionDisabled}
          onClick={onAction}
        >
          {action}
        </button>
      )}
      {actions}
    </article>
  );
}

function EmptyWorkspace({ children }: { children: string }) {
  return <p className="empty-workspace">{children}</p>;
}
