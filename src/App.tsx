import React, { useEffect, useState } from "react";

const iconShapes = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  handshake: (
    <>
      <path d="m11 17 2 2a2 2 0 0 0 3-2" />
      <path d="m14 14 4 4a2 2 0 0 0 3-3l-6-6-4 1-3-3-6 6 4 4a2 2 0 0 0 3 0l2-2" />
      <path d="m2 12 3 3m17-4-3 3M7 7l4-3 5 1 4-1 2 3-4 3" />
    </>
  ),
  bank: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M4 10h16M5 10v9m5-9v9m4-9v9m5-9v9M3 21h18M2 19h20" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </>
  ),
  arrows: (
    <>
      <path d="M7 7h14m0 0-4-4m4 4-4 4M17 17H3m0 0 4 4m-4-4 4-4" />
    </>
  ),
  arrowDown: <path d="M12 5v14m-7-7 7 7 7-7" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M9 5V3h6v2m-6 5h6m-6 4h6" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-5 5" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6m-10 5h4m-4 4h4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <path d="M10 6h4a2 2 0 0 1 2 2v6m-3 3h-3a2 2 0 0 1-2-2v-3" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
      <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
} satisfies Record<string, React.ReactNode>;

type IconName = keyof typeof iconShapes;

interface Agent {
  name: string;
  icon: IconName;
  description: string;
}

interface Actor {
  name: string;
  icon: IconName;
  description: string;
}

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

function Icon({ name, size = 18, className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconShapes[name]}
    </svg>
  );
}

const agents = [
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
] satisfies Agent[];

const actors = [
  {
    name: "Customer",
    icon: "users",
    description: "Applies for credit, gives consent, and receives offers.",
  },
  {
    name: "Broker",
    icon: "handshake",
    description: "Finds banks, submits applications, and negotiates.",
  },
  {
    name: "Bank",
    icon: "bank",
    description: "Owns the lending process and final decision.",
  },
  {
    name: "Credit Bureau",
    icon: "database",
    description: "Maintains credit history and provides authorized reports.",
  },
  {
    name: "Credit Officer",
    icon: "clipboard",
    description: "Reviews applications and makes lending decisions.",
  },
  {
    name: "Administrator",
    icon: "workflow",
    description: "Manages institutions, users, and permissions.",
  },
  {
    name: "Regulator / Auditor",
    icon: "shield",
    description: "Reviews compliance and audit records.",
  },
] satisfies Actor[];

interface FlowNodeProps {
  icon: IconName;
  eyebrow: string;
  title: string;
  description: string;
  variant?: string;
}

function FlowNode({ icon, eyebrow, title, description, variant = "" }: FlowNodeProps) {
  return (
    <div className={`flow-node ${variant}`}>
      <span className="node-icon"><Icon name={icon} size={19} /></span>
      <span className="node-eyebrow">{eyebrow}</span>
      <strong>{title}</strong>
      <span className="node-description">{description}</span>
    </div>
  );
}

interface ConnectorProps {
  horizontal?: boolean;
}

function Connector({ horizontal = false }: ConnectorProps) {
  return (
    <div className={`connector${horizontal ? " connector-horizontal" : ""}`} aria-hidden="true">
      {horizontal ? <Icon name="arrows" size={17} /> : <Icon name="arrowDown" size={16} />}
    </div>
  );
}

function App() {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (!workflowRunning) return undefined;

    let nextStep = 0;
    const timer = window.setInterval(() => {
      if (nextStep >= agents.length - 1) {
        window.clearInterval(timer);
        setWorkflowRunning(false);
        return;
      }

      nextStep += 1;
      setCurrentStep(nextStep);
    }, 850);

    return () => window.clearInterval(timer);
  }, [workflowRunning]);

  function runDemo() {
    if (workflowRunning) return;
    setCurrentStep(0);
    setHasRun(true);
    setWorkflowRunning(true);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="The Credit Bureau home">
          <span className="brand-mark"><Icon name="database" size={19} /></span>
          <span>The Credit Bureau</span>
        </a>
        <div className="topbar-right">
          <span className="environment-tag"><span className="status-dot" /> DEMO ENVIRONMENT</span>
          <span className="avatar" aria-label="Credit Bureau">CB</span>
        </div>
      </header>

      <main id="overview">
        <section className="intro">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> CREDIT FLOW OVERVIEW</p>
            <h1>A clearer view of<br className="mobile-break" /> every credit flow.</h1>
            <p className="intro-copy">
              People, institutions, and AI agents working together across the credit journey.
            </p>
          </div>
          <button
            className={`run-button${workflowRunning ? " is-running" : ""}`}
            onClick={runDemo}
            disabled={workflowRunning}
          >
            <Icon name={workflowRunning ? "workflow" : hasRun ? "check" : "spark"} size={16} />
            {workflowRunning ? "Workflow running" : hasRun ? "Run again" : "Run demo flow"}
          </button>
        </section>

        <section className="flow-card" aria-labelledby="flow-title">
          <div className="flow-card-header">
            <div>
              <span className="section-index">01 / SYSTEM MAP</span>
              <h2 id="flow-title">The credit journey</h2>
            </div>
            <span className={`live-badge${workflowRunning ? " live-badge-running" : ""}`}>
              <span className="status-dot" />
              {workflowRunning ? "PROCESSING" : hasRun ? "FLOW COMPLETE" : "SYSTEM READY"}
            </span>
          </div>

          <div className="flow-diagram">
            <FlowNode
              icon="users"
              eyebrow="APPLICANTS"
              title="Customers"
              description="Individuals · Companies · Applicants"
              variant="customer-node"
            />

            <div className="actor-exchange">
              <FlowNode
                icon="handshake"
                eyebrow="INTERMEDIARIES"
                title="Brokers"
                description="Connect applicants with lenders"
                variant="side-node"
              />
              <Connector horizontal />
              <FlowNode
                icon="bank"
                eyebrow="LENDERS"
                title="Banks"
                description="Own the lending decision"
                variant="side-node"
              />
            </div>

            <Connector />
            <FlowNode
              icon="database"
              eyebrow="CREDIT REPORTS · LIABILITIES · HISTORY · INQUIRIES"
              title="The Credit Bureau"
              description="A trusted source for authorized credit information"
              variant="bureau-node"
            />
            <Connector />

            <div className="agents-panel">
              <div className="agents-panel-heading">
                <div>
                  <span className="section-index">COORDINATED AUTOMATION</span>
                  <h3>AI agent orchestration</h3>
                </div>
                <span className="agent-count"><Icon name="spark" size={13} /> {agents.length} AGENTS</span>
              </div>
              <div className="agent-grid">
                {agents.map((agent, index) => {
                  const isActive = workflowRunning && currentStep === index;
                  const isComplete = workflowRunning && currentStep > index;
                  const isSelected = selectedAgent === index;

                  return (
                    <button
                      type="button"
                      className={`agent-item${isActive ? " agent-active" : ""}${isComplete ? " agent-complete" : ""}${isSelected ? " agent-selected" : ""}`}
                      key={agent.name}
                      onClick={() => setSelectedAgent(isSelected ? null : index)}
                      aria-pressed={isSelected}
                      aria-label={`${agent.name}: ${agent.description}`}
                    >
                      <span className="agent-icon">
                        <Icon name={isComplete ? "check" : agent.icon} size={15} />
                      </span>
                      <span className="agent-name">{agent.name}</span>
                      {isActive && <span className="agent-status">RUNNING</span>}
                    </button>
                  );
                })}
              </div>
              {selectedAgent !== null && (
                <div className="agent-detail" role="status">
                  <Icon name={agents[selectedAgent].icon} size={16} />
                  <span><strong>{agents[selectedAgent].name}</strong> — {agents[selectedAgent].description}</span>
                  <button
                    className="detail-close"
                    type="button"
                    onClick={() => setSelectedAgent(null)}
                    aria-label="Close agent details"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <Connector />
            <div className="infrastructure">
              <span className="infrastructure-icon"><Icon name="workflow" size={17} /></span>
              <strong>Backend &amp; infrastructure</strong>
              <span>Web API <i /> SQL server <i /> Message bus <i /> Audit log</span>
            </div>
          </div>

          <footer className="flow-card-footer">
            <Icon name="lock" size={13} />
            Consent-first · Human-reviewed · Audit-ready
            <span>DEMO DATA ONLY</span>
          </footer>
        </section>

        <section className="actors-section" aria-labelledby="actors-title">
          <div className="actors-heading">
            <div>
              <span className="section-index">02 / PEOPLE &amp; RESPONSIBILITIES</span>
              <h2 id="actors-title">Built around people.</h2>
            </div>
            <p>Every participant has a clear role in the process.</p>
          </div>
          <div className="actor-grid">
            {actors.map((actor) => (
              <article className="actor-card" key={actor.name}>
                <span className="actor-card-icon"><Icon name={actor.icon} size={17} /></span>
                <h3>{actor.name}</h3>
                <p>{actor.description}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="page-footer">
          <span>THE CREDIT BUREAU <span className="footer-divider">/</span> CREDIT FLOW PROTOTYPE</span>
          <span>Designed for transparency, built for trust.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
