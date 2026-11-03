import {
  Check,
  CheckCircle2,
  FileCode2,
  GitBranch,
  ArrowRight,
  Circle,
  AlertCircle,
} from "lucide-react";
import { useProductMotion } from "./ProductMotion";

export const engineeringStages = [
  "Requirements",
  "Implementation plan",
  "Interface design",
  "Implementation",
  "Test failure",
  "Fix & verification",
  "Deployment",
];
export const engineeringBriefs = {
  websites: {
    title: "A studio website, from brief to browser",
    user: "Visitors need to explore projects and send an enquiry from any device.",
    requirements: [
      "Clear routes for Studio, Journal and Contact",
      "Accessible enquiry form with useful validation",
      "Responsive pages and optimized imagery",
    ],
    entities: ["Page", "Journal entry", "Enquiry"],
    tasks: [
      "Map content and page routes",
      "Build responsive page components",
      "Connect and validate enquiries",
    ],
    file: "contact-form.tsx",
    test: "rejects an empty enquiry email",
    before: "if (email) submitEnquiry(values);",
    after: 'if (!email.trim()) return setError("Email is required");',
    assertion: 'expect(error).toHaveText("Email is required")',
    failure: "Expected validation message; received no feedback.",
    fix: "Show an inline error before submitting the form.",
    routes: ["Home", "Journal", "Contact"],
    fields: ["Your name", "Email address", "Project details"],
    action: "Send enquiry",
    event: "Enquiry received",
    branch: "feat/studio-website",
  },
  crm: {
    title: "A pipeline that follows the customer",
    user: "Sales teams need a reliable path from a qualified lead to a signed deal.",
    requirements: [
      "Associate deals with a contact and an owner",
      "Require a signed proposal before closing",
      "Recalculate weighted forecast on stage changes",
    ],
    entities: ["Contact", "Deal", "Activity"],
    tasks: [
      "Define stages and required properties",
      "Build deal board and activity timeline",
      "Connect stage updates to revenue reporting",
    ],
    file: "deal-stage.ts",
    test: "prevents closing an unsigned deal",
    before: 'await updateStage(deal.id, "won");',
    after: 'if (!deal.signedAt) throw Error("Signature required");',
    assertion: "expect(result.status).toBe(422)",
    failure: "Expected 422; unsigned deal was marked won.",
    fix: "Validate the signature before changing the stage.",
    routes: ["Pipeline", "Deal details", "Reports"],
    fields: [
      "Deal owner",
      "Amount · $36,000",
      "Signed proposal · Awaiting signature",
    ],
    action: "Move to closed won",
    event: "Forecast recalculated",
    branch: "feat/deal-lifecycle",
  },
  erp: {
    title: "Purchasing with an audit trail",
    user: "Operations and finance need to agree on what was ordered, received and billed.",
    requirements: [
      "Route purchase requests to an approver",
      "Record receipt against the purchase order",
      "Hold bills when received quantities differ",
    ],
    entities: ["Request", "Purchase order", "Receipt"],
    tasks: [
      "Model approval roles and purchase states",
      "Build request and supplier document views",
      "Add receipt and invoice matching",
    ],
    file: "invoice-match.ts",
    test: "holds a bill with an incomplete receipt",
    before: "return bill.quantity === order.quantity;",
    after: "return bill.quantity === receipt.quantity;",
    assertion: 'expect(invoice.status).toBe("on_hold")',
    failure: "Bill approved for 24 units; only 20 received.",
    fix: "Compare billed quantity against the warehouse receipt.",
    routes: ["Requests", "Purchase order", "Finance"],
    fields: ["Supplier · Nova Systems", "Ordered · 24", "Received · 20"],
    action: "Review purchase",
    event: "Approval recorded",
    branch: "feat/purchase-controls",
  },
  analytics: {
    title: "From raw events to trusted decisions",
    user: "Finance needs a revenue report that reconciles with settled payments.",
    requirements: [
      "Join orders and payment records by stable keys",
      "Exclude pending payments from net revenue",
      "Drill into a segment without losing context",
    ],
    entities: ["Orders", "Payments", "Revenue model"],
    tasks: [
      "Map sources and revenue definitions",
      "Build tested models and segment filters",
      "Publish a shared report with drilldowns",
    ],
    file: "revenue_model.sql",
    test: "excludes pending payment revenue",
    before: "WHERE status IN ('settled', 'pending')",
    after: "WHERE status = 'settled'",
    assertion: "expect(netRevenue).toBe(86400)",
    failure: "Expected $86,400; pending payments added $4,800.",
    fix: "Filter to settled payments before aggregation.",
    routes: ["Overview", "Revenue model", "Segments"],
    fields: [
      "Period · This quarter",
      "Segment · Enterprise",
      "Metric · Net revenue",
    ],
    action: "Apply filter",
    event: "Report refreshed",
    branch: "feat/revenue-model",
  },
  commerce: {
    title: "Every order, accounted for",
    user: "Store operators need paid orders to reach fulfillment exactly once.",
    requirements: [
      "Create an order after payment confirmation",
      "Handle duplicate webhook deliveries safely",
      "Track packing, shipping and customer updates",
    ],
    entities: ["Payment", "Order", "Fulfillment"],
    tasks: [
      "Map checkout and fulfillment events",
      "Build order detail and packing views",
      "Deduplicate payment webhook deliveries",
    ],
    file: "payment-webhook.ts",
    test: "ignores a repeated payment event",
    before: "await createOrder(event.data);",
    after: "if (await processed(event.id)) return acknowledge();",
    assertion: "expect(ordersFor(payment.id)).toHaveLength(1)",
    failure: "Repeated event created two orders for one payment.",
    fix: "Check the event identifier before creating an order.",
    routes: ["Orders", "Order #1048", "Fulfillment"],
    fields: ["Payment · Confirmed", "Items · 3", "Delivery · Express"],
    action: "Create shipping label",
    event: "Order fulfilled",
    branch: "feat/order-fulfillment",
  },
  logistics: {
    title: "Stock that stays in sync",
    user: "Warehouse teams need to reserve, pick and dispatch the right quantities.",
    requirements: [
      "Separate on-hand, reserved and available stock",
      "Validate scanned items against the pick list",
      "Record source and destination on every transfer",
    ],
    entities: ["Stock item", "Reservation", "Transfer"],
    tasks: [
      "Define stock balances and transfer states",
      "Build scan and dispatch workspaces",
      "Validate available stock before reservation",
    ],
    file: "reserve-stock.ts",
    test: "rejects a reservation above available stock",
    before: "const available = stock.onHand;",
    after: "const available = stock.onHand - stock.reserved;",
    assertion: 'expect(reserve(30)).toEqual({ error: "Insufficient stock" })',
    failure: "30 requested; 24 available after existing reservations.",
    fix: "Subtract reserved units before accepting a transfer.",
    routes: ["Inventory", "Pick list", "Dispatch"],
    fields: ["On hand · 48", "Reserved · 24", "Available · 24"],
    action: "Reserve transfer",
    event: "Stock ledger updated",
    branch: "feat/warehouse-transfers",
  },
  automation: {
    title: "Support that acts with context",
    user: "Customers need accurate answers and a confirmed replacement when an item arrives damaged.",
    requirements: [
      "Retrieve the applicable policy and order record",
      "Ask for confirmation before placing a replacement",
      "Escalate requests when policy evidence is missing",
    ],
    entities: ["Conversation", "Policy source", "Tool action"],
    tasks: [
      "Connect policy retrieval and order lookup",
      "Design agent replies and customer confirmation",
      "Evaluate grounded replies and tool permissions",
    ],
    file: "replacement-agent.ts",
    test: "waits for customer confirmation before acting",
    before: "return createReplacement(order.id);",
    after: "if (!confirmed) return askForConfirmation(order.id);",
    assertion: "expect(replacementTool).not.toHaveBeenCalled()",
    failure: "Replacement created before the customer approved it.",
    fix: "Gate the replacement tool on explicit confirmation.",
    routes: ["Inbox", "Knowledge", "Tool activity"],
    fields: [
      "Order · #4821",
      "Policy · Damaged items",
      "Confirmation · Required",
    ],
    action: "Review replacement",
    event: "Replacement confirmed",
    branch: "feat/support-agent",
  },
};

const baselineChecks = {
  websites: [
    "Valid enquiry reaches the inbox",
    "Form fields have accessible labels",
  ],
  crm: [
    "Deal remains associated with its owner",
    "Only permitted users can change stages",
  ],
  erp: [
    "Approved request creates a purchase order",
    "Receipt remains linked to its order",
  ],
  analytics: [
    "Order keys are unique and non-null",
    "Payment amounts have a valid numeric type",
  ],
  commerce: [
    "Payment signature is verified",
    "Paid order creates a fulfillment record",
  ],
  logistics: [
    "Scanned SKU matches the pick list",
    "Transfer records source and destination",
  ],
  automation: [
    "Answer cites the retrieved policy",
    "Missing evidence routes to a human",
  ],
};
export function EngineeringStory({ domain, phase }) {
  const d = engineeringBriefs[domain];
  const { progress, reduced } = useProductMotion();
  const step = reduced ? 3 : Math.min(3, Math.floor(progress * 4));
  const checked = (index) => reduced || progress > 0.14 + index * 0.2;
  return (
    <div className="engineering-story" data-engineering-stage={phase}>
      <header className="eng-heading">
        <div>
          <small>
            {phase < 3 ? "PRODUCT DEVELOPMENT" : "ENGINEERING WORKSPACE"}
          </small>
          <h4>{engineeringStages[phase]}</h4>
        </div>
        <span>
          <GitBranch size={13} />
          {d.branch}
        </span>
      </header>
      {phase === 0 && (
        <div className="eng-brief">
          <div className="eng-document-label">
            PROJECT BRIEF <span>v1.0 · Reviewed by product & engineering</span>
          </div>
          <h5>{d.title}</h5>
          <p>{d.user}</p>
          <small>ACCEPTANCE CRITERIA</small>
          <div className="eng-criteria">
            {d.requirements.map((r, i) => (
              <div key={r} className={checked(i) ? "complete" : ""}>
                {checked(i) ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                <span>{r}</span>
                <small>{checked(i) ? "Agreed" : "Reviewing"}</small>
              </div>
            ))}
          </div>
          <footer>
            Scope review{" "}
            <b>
              {step === 3
                ? "Ready for planning"
                : "Confirming expected behavior…"}
            </b>
          </footer>
        </div>
      )}
      {phase === 1 && (
        <>
          <div className="eng-section-title">
            <h5>Implementation board</h5>
            <span>Release 01 · Product / Engineering</span>
          </div>
          <div className="eng-plan">
            {d.tasks.map((t, i) => (
              <article key={t}>
                <small>{["FOUNDATION", "INTERFACE", "INTEGRATION"][i]}</small>
                <span className="eng-ticket">ST–{101 + i}</span>
                <h5>{t}</h5>
                <p>{d.requirements[i]}</p>
                <footer>
                  <span className="eng-avatar">{["AM", "SC", "JL"][i]}</span>
                  <span>
                    {checked(i) ? "Ready to build" : "Refining scope"}
                  </span>
                </footer>
              </article>
            ))}
          </div>
          <div className="eng-data-flow">
            <small>DATA FLOW</small>
            {d.entities.map((e, i) => (
              <span key={e}>
                {i > 0 && <ArrowRight size={16} />}
                <b>{e}</b>
              </span>
            ))}
          </div>
        </>
      )}
      {phase === 2 && (
        <div className="eng-design">
          <div className="eng-design-tools">
            <small>COMPONENTS</small>
            {["Navigation", "Record card", "Form fields", "Status badge"].map(
              (v, i) => (
                <span className={step === i ? "active" : ""} key={v}>
                  {v}
                </span>
              ),
            )}
            <small>COLOR STYLES</small>
            <div className="eng-swatches">
              <i />
              <i />
              <i />
              <i />
            </div>
            <small>TYPE SCALE</small>
            <b>Aa</b>
            <span>Inter · 14 / 20 / 32</span>
          </div>
          <div className="eng-artboard">
            <small>
              DESKTOP /{" "}
              {d.routes[
                domain === "websites" ? 2 : domain === "automation" ? 2 : 1
              ].toUpperCase()}
            </small>
            <div className="eng-prototype">
              <nav>
                {d.routes.map((r, i) => (
                  <span
                    key={r}
                    className={
                      i ===
                      (domain === "websites" || domain === "automation" ? 2 : 1)
                        ? "active"
                        : ""
                    }
                  >
                    {r}
                  </span>
                ))}
              </nav>
              <h5>{d.title}</h5>
              <div className="eng-prototype-fields">
                {d.fields.map((f, i) => (
                  <div key={f} className={step === i ? "selected" : ""}>
                    <small>{f.split(" · ")[0]}</small>
                    <b>
                      {f.split(" · ")[1] ||
                        [
                          "Alex Morgan",
                          "alex@example.com",
                          "A new studio website",
                        ][i]}
                    </b>
                  </div>
                ))}
              </div>
              <span className="eng-primary">
                {d.action}
                <ArrowRight size={14} />
              </span>
            </div>
            <p>
              Reviewing navigation, field states and spacing before
              implementation.
            </p>
          </div>
        </div>
      )}
      {phase >= 3 && phase <= 5 && (
        <div className="eng-ide">
          <div className="eng-files">
            <small>EXPLORER</small>
            {[d.file, "validation.test.ts", "release.yml"].map((f, i) => (
              <span
                className={i === (phase === 4 ? 1 : 0) ? "active" : ""}
                key={f}
              >
                <FileCode2 size={13} />
                {f}
              </span>
            ))}
            <div>
              <GitBranch size={13} />3 files changed
            </div>
          </div>
          <div className="eng-editor">
            <div className="eng-editor-tab">
              <FileCode2 size={14} />
              {phase === 4 ? "validation.test.ts" : d.file}
              <span>{phase === 5 ? "Patch applied" : "Working tree"}</span>
            </div>
            <div className="eng-code">
              <p>
                <i>1</i>
                <span>
                  {domain === "analytics" && phase !== 4 ? "--" : "//"}{" "}
                  {d.tasks[2]}
                </span>
              </p>
              <p>
                <i>2</i>
                <span>
                  {phase === 4
                    ? 'test("' + d.test + '", async () => {'
                    : domain === "analytics"
                      ? "SELECT SUM(net_revenue) AS revenue"
                      : "async function handleAction(input) {"}
                </span>
              </p>
              <p>
                <i>3</i>
                <span>
                  {domain === "analytics" && phase !== 4
                    ? "FROM finance.orders"
                    : "  const context = await loadContext(input);"}
                </span>
              </p>
              <p
                className={
                  phase === 5
                    ? "eng-added"
                    : phase === 4
                      ? "eng-error-line"
                      : ""
                }
              >
                <i>4</i>
                <code>
                  {phase === 4
                    ? d.assertion
                    : phase === 5
                      ? d.after
                      : d.before.slice(
                          0,
                          Math.ceil(
                            d.before.length * Math.min(1, progress * 2),
                          ),
                        )}
                </code>
              </p>
              <p>
                <i>5</i>
                <span>
                  {phase === 4 ? "});" : domain === "analytics" ? ";" : "}"}
                </span>
              </p>
            </div>
            <div className="eng-test-panel">
              <header>
                TEST RESULTS{" "}
                <span>
                  {phase === 3
                    ? "Watch mode"
                    : phase === 4
                      ? "1 failed · 2 passed"
                      : step < 2
                        ? "Re-running checks…"
                        : "3 passed"}
                </span>
              </header>
              <p className="eng-pass">
                <Check size={14} />
                {baselineChecks[domain][0]}
              </p>
              <p className="eng-pass">
                <Check size={14} />
                {baselineChecks[domain][1]}
              </p>
              <p
                className={
                  phase === 4
                    ? "eng-fail"
                    : phase === 5 && step >= 2
                      ? "eng-pass"
                      : ""
                }
              >
                {phase === 4 ? (
                  <AlertCircle size={14} />
                ) : phase === 5 && step >= 2 ? (
                  <Check size={14} />
                ) : (
                  <Circle size={14} />
                )}{" "}
                {d.test}
              </p>
              {phase === 4 && <aside>{d.failure}</aside>}
              {phase === 5 && (
                <aside className="eng-resolution">
                  {d.fix}
                  <b>
                    {step >= 2
                      ? "Regression check passed. Ready to release."
                      : "Verifying the corrected behavior…"}
                  </b>
                </aside>
              )}
            </div>
          </div>
        </div>
      )}
      {phase === 6 && (
        <div className="eng-release">
          <div className="eng-release-heading">
            <div className="eng-release-icon">
              <GitBranch size={24} />
            </div>
            <h5>Release / production</h5>
            <p>{d.branch} → main</p>
          </div>
          <div className="eng-deploy-steps">
            {[
              "Build application",
              "Run regression suite",
              "Deploy release",
              "Verify health check",
            ].map((v, i) => (
              <div className={i <= step ? "complete" : ""} key={v}>
                {i <= step ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                <span>
                  {v}
                  <small>
                    {
                      [
                        "Assets compiled",
                        "3 checks passed",
                        "Version 1.0 promoted",
                        "HTTP 200 · Application ready",
                      ][i]
                    }
                  </small>
                </span>
                <b>{i <= step ? "Passed" : "Queued"}</b>
              </div>
            ))}
          </div>
          <div className="eng-release-result">
            {step === 3 ? (
              <>
                <CheckCircle2 size={17} />
                Release healthy. Opening the live workspace…
              </>
            ) : (
              "Release checks in progress…"
            )}
          </div>
        </div>
      )}
    </div>
  );
}
