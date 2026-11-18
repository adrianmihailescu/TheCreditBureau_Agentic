import { useState, type DragEvent, type FormEvent } from "react";
import type { DemoAccount } from "../../accounts/types/demoAccount";
import type {
  DemoApplicationRow,
  DemoDocumentType,
  WorkflowActorRole,
} from "../models/application";
import { documentTypes, workflowActorRoles } from "../models/application";
import { getApplicationView } from "../access/applicationAccess";
import { useDemoWorkflow } from "./DemoWorkflowContext";
import type { DemoDecision } from "./types/workflowContext";
import type {
  ActorWorkspaceProps,
  WorkflowRecordProps,
} from "./types/actorWorkspace";
import type { DemoFlowLimits } from "./workflowRules";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const maximumWorkflowSteps = 8;
type AddableWorkflowStepRole = Exclude<WorkflowActorRole, "Credit Officer">;
const addableWorkflowStepRoles = workflowActorRoles.filter(
  (role): role is AddableWorkflowStepRole => role !== "Credit Officer",
);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The database request failed.";
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
        <ActorApprovalWorkspace applications={scopedRows} account={account} role="Broker" />
      )}
      {account.role === "Bank" && (
        <ActorApprovalWorkspace applications={scopedRows} account={account} role="Bank" />
      )}
      {account.role === "Credit Bureau" && (
        <ActorApprovalWorkspace applications={scopedRows} account={account} role="Credit Bureau" />
      )}
      {account.role === "Credit Officer" && (
        <ActorApprovalWorkspace applications={scopedRows} account={account} role="Credit Officer" />
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
      setMessage(`Application ${applicationId} submitted to the first configured workflow step.`);
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

function ActorApprovalWorkspace({
  applications,
  account,
  role,
}: {
  applications: DemoApplicationRow[];
  account: DemoAccount;
  role: WorkflowActorRole;
}) {
  const { recordWorkflowDecision, getIssues } = useDemoWorkflow();
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState("");
  const reviewQueue = applications.filter((application) =>
    application.status !== "Approved" &&
    application.status !== "Rejected" &&
    application.workflowSteps[application.currentWorkflowStepIndex] === role,
  );

  async function decide(applicationId: string, decision: DemoDecision) {
    try {
      const result = await recordWorkflowDecision(account, applicationId, decision);
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
          <h3>{role} approval queue</h3>
          <p>
            {role === "Credit Officer"
              ? "Final lending decisions require a human credit officer."
              : role === "Credit Bureau"
                ? "Approval prepares a fictional report using customer consent; no real bureau is contacted."
                : "Approve to continue or reject to stop the application flow."}
          </p>
        </div>
      </div>
      {role === "Credit Officer" && (
        <label className="workflow-check decision-acknowledgement">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.currentTarget.checked)}
          />
          I am recording a human-reviewed demo decision as the Credit Officer.
        </label>
      )}
      <div className="workspace-record-list">
        {reviewQueue.map((application) => {
          const issues = getIssues(application);
          const needsBureauReport = role === "Credit Officer" &&
            application.workflowSteps.includes("Credit Bureau") &&
            application.consentRecorded &&
            !application.reportPrepared;
          const needsConsent = role === "Credit Bureau" && !application.consentRecorded;
          return (
            <WorkflowRecord
              key={application.id}
              application={application}
              details={role === "Credit Bureau"
                ? `${application.product} · ${application.consentRecorded ? "Consent recorded" : "No consent recorded"}`
                : `${application.customer.name} · ${application.product} · ${money.format(application.requestedAmount)}${role === "Credit Officer" ? ` · ${application.report ? `Demo report ${application.report.demoScore}` : application.reportPrepared ? "Demo report prepared" : "No report"}` : ""}`}
              issues={issues}
              actions={(
                <div className="decision-actions">
                  <button
                    className="workflow-primary-button"
                    type="button"
                    disabled={issues.length > 0 || needsBureauReport || needsConsent || (role === "Credit Officer" && !acknowledged)}
                    onClick={() => decide(application.id, "Approved")}
                  >
                    {role === "Credit Bureau"
                      ? application.reportPrepared
                        ? "Approve & continue"
                        : "Prepare report & approve"
                      : role === "Credit Officer"
                        ? "Record human approval"
                        : "Approve & continue"}
                  </button>
                  <button
                    className="workflow-secondary-button"
                    type="button"
                    disabled={role === "Credit Officer" && !acknowledged}
                    onClick={() => decide(application.id, "Rejected")}
                  >
                    Reject & stop flow
                  </button>
                </div>
              )}
              showCustomer={role !== "Credit Bureau"}
            />
          );
        })}
        {reviewQueue.length === 0 && (
          <EmptyWorkspace>{`No applications are waiting for ${role} approval.`}</EmptyWorkspace>
        )}
      </div>
      {message && <p className="workflow-feedback" role="status">{message}</p>}
    </div>
  );
}

function AdministratorWorkspace({ account }: { account: DemoAccount }) {
  const { limits, updateLimits, applications, banks } = useDemoWorkflow();
  const [formLimits, setFormLimits] = useState<DemoFlowLimits>(limits);
  const [stepRoleToAdd, setStepRoleToAdd] = useState<AddableWorkflowStepRole>("Broker");
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [stepMessage, setStepMessage] = useState("");
  const [isSavingSteps, setIsSavingSteps] = useState(false);

  function toggleRequiredDocument(document: DemoDocumentType) {
    setFormLimits((current) => ({
      ...current,
      requiredDocuments: current.requiredDocuments.includes(document)
        ? current.requiredDocuments.filter((item) => item !== document)
        : [...current.requiredDocuments, document],
    }));
  }

  const selectedRoleToAdd = stepRoleToAdd;

  function moveStep(fromIndex: number, toIndex: number) {
    setFormLimits((current) => {
      const steps = [...current.workflowSteps];
      const [moved] = steps.splice(fromIndex, 1);
      if (!moved) return current;
      steps.splice(toIndex, 0, moved);
      return { ...current, workflowSteps: steps };
    });
  }

  function handleStepDrop(event: DragEvent<HTMLLIElement>, targetIndex: number) {
    event.preventDefault();
    const sourceIndex = draggedStepIndex;
    setDraggedStepIndex(null);
    if (sourceIndex === null || sourceIndex === targetIndex) return;
    const creditOfficerIndex = formLimits.workflowSteps.indexOf("Credit Officer");
    const boundedTarget = Math.min(targetIndex, creditOfficerIndex - 1);
    moveStep(sourceIndex, boundedTarget);
  }

  function removeStep(index: number) {
    setFormLimits((current) => ({
      ...current,
      workflowSteps: current.workflowSteps.filter((_, stepIndex) => stepIndex !== index),
    }));
  }

  function addStep() {
    if (!selectedRoleToAdd || formLimits.workflowSteps.length >= maximumWorkflowSteps) return;
    setFormLimits((current) => {
      const steps = [...current.workflowSteps];
      steps.splice(steps.length - 1, 0, selectedRoleToAdd);
      return { ...current, workflowSteps: steps };
    });
  }

  async function handleSaveSteps() {
    setIsSavingSteps(true);
    setStepMessage("");
    try {
      await updateLimits(account, {
        ...limits,
        workflowSteps: [...formLimits.workflowSteps],
      });
      setStepMessage("Workflow steps saved. They apply to new applications.");
    } catch (error) {
      setStepMessage(error instanceof Error ? error.message : "Unable to save workflow steps.");
    } finally {
      setIsSavingSteps(false);
    }
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
          <h3>Workflow steps, limits, and requirements</h3>
          <p>Each configured actor must approve to continue. Any rejection stops the flow; final approval stays with a human Credit Officer.</p>
        </div>
      </div>
      <form className="workflow-form admin-limit-form" onSubmit={handleSave}>
        <fieldset className="workflow-choice-group workflow-step-settings">
          <legend>Approval steps</legend>
          <p className="workflow-hint">
            Drag an entire row to reorder. You can add the same actor more than once, up to eight
            steps. Every step needs approval; any rejection stops the flow. Credit Officer stays
            required and final.
          </p>
          <span id="workflow-step-reorder-help" className="visually-hidden">
            Use the up and down arrow keys to reorder this step. Credit Officer must remain last.
          </span>
          <ol className="workflow-step-list">
            {formLimits.workflowSteps.map((role, index) => (
              <li
                className={`workflow-step-item${draggedStepIndex === index ? " workflow-step-dragging" : ""}`}
                key={`${role}-${index}`}
                draggable={role !== "Credit Officer"}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleStepDrop(event, index)}
                onDragStart={(event) => {
                  setDraggedStepIndex(index);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                }}
                onDragEnd={() => setDraggedStepIndex(null)}
              >
                {role === "Credit Officer" ? (
                  <span className="workflow-step-grip workflow-step-grip-fixed">FIXED</span>
                ) : (
                  <button
                    className="workflow-step-grip"
                    type="button"
                    aria-label={`Keyboard reorder ${role}, step ${index + 1}`}
                    aria-describedby="workflow-step-reorder-help"
                    aria-keyshortcuts="ArrowUp ArrowDown"
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp" && index > 0) {
                        event.preventDefault();
                        moveStep(index, index - 1);
                      } else if (
                        event.key === "ArrowDown" &&
                        index < formLimits.workflowSteps.length - 2
                      ) {
                        event.preventDefault();
                        moveStep(index, index + 1);
                      }
                    }}
                  >
                    DRAG
                  </button>
                )}
                <span className="workflow-step-copy">
                  <strong>{index + 1}. {role}</strong>
                  <small>
                    {role === "Credit Officer"
                      ? "Required human final decision"
                      : role === "Credit Bureau"
                        ? "Approval prepares a fictional report; requires consent"
                        : "Approval required to continue"}
                  </small>
                </span>
                <div className="workflow-step-controls">
                  <button
                    className="workflow-secondary-button"
                    type="button"
                    aria-label={`Remove ${role} step ${index + 1}`}
                    disabled={role === "Credit Officer"}
                    onClick={() => removeStep(index)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="workflow-step-add">
            <label>
              Add actor step
              <select
                value={selectedRoleToAdd ?? ""}
                disabled={formLimits.workflowSteps.length >= maximumWorkflowSteps}
                onChange={(event) => {
                  const role = addableWorkflowStepRoles.find((item) => item === event.currentTarget.value);
                  if (role) setStepRoleToAdd(role);
                }}
              >
                {addableWorkflowStepRoles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <button
              className="workflow-secondary-button"
              type="button"
              disabled={!selectedRoleToAdd || formLimits.workflowSteps.length >= maximumWorkflowSteps}
              onClick={addStep}
            >
              Add step
            </button>
          </div>
          <div className="workflow-step-actions">
            <button
              className="workflow-primary-button"
              type="button"
              disabled={isSavingSteps}
              onClick={() => { void handleSaveSteps(); }}
            >
              {isSavingSteps ? "Saving steps…" : "Save steps"}
            </button>
            {stepMessage && <span className="workflow-feedback" role="status">{stepMessage}</span>}
          </div>
        </fieldset>
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
          <button className="workflow-primary-button" type="submit">Save all settings</button>
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
