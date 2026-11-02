import { useState } from "react";
import { OrbitCanvas, Reveal, useSiteMotion } from "./MotionSystem";
import { Eyebrow, Icon, TextLink } from "./ui";

const connections = [
  {
    label: "Website",
    icon: "globe",
    title: "A connected customer journey.",
    text: "Your website captures the opportunity. Your CRM gives it context. Your team knows exactly where the relationship stands.",
    flow: ["Website inquiry", "CRM pipeline", "Customer history"],
  },
  {
    label: "CRM",
    icon: "users",
    title: "Relationships, with all the context.",
    text: "Bring contacts, conversations, and opportunities into one place. Give every handoff the context your team needs to keep the relationship moving.",
    flow: ["Lead captured", "Owner assigned", "Next step clear"],
  },
  {
    label: "ERP",
    icon: "layers",
    title: "The whole operation. One shared view.",
    text: "Purchasing, resources, approvals, and finance work from a common record. Less reconciliation between tools. More clarity across your business.",
    flow: ["Request created", "Approval routed", "Records connected"],
  },
  {
    label: "Analytics",
    icon: "chart",
    title: "Decisions with a clearer picture.",
    text: "Bring data from your business systems into focused dashboards. Understand the performance, spot the exceptions, and decide what happens next.",
    flow: ["Data connected", "Metrics aligned", "Decisions informed"],
  },
  {
    label: "Commerce",
    icon: "bag",
    title: "From the first click to the final mile.",
    text: "Connect the storefront to orders, payments, and fulfillment. A considered customer experience continues long after the checkout.",
    flow: ["Order received", "Stock allocated", "Delivery arranged"],
  },
  {
    label: "Logistics",
    icon: "box",
    title: "Everything moving in the right direction.",
    text: "Keep inventory, warehouse activity, and shipment progress in the same picture. Help your operations team act on what is happening now.",
    flow: ["Stock received", "Order picked", "Shipment tracked"],
  },
];
export function ConnectedSystems() {
  const [active, setActive] = useState(2);
  const selected = connections[active];
  return (
    <section className="connected-section">
      <div className="container">
        <div className="connected-top">
          <Eyebrow light>THE BIGGER PICTURE</Eyebrow>
          <span>
            <i />
            BUILT TO WORK TOGETHER
          </span>
        </div>
        <div className="connected-layout">
          <Reveal className="connected-copy">
            <h2>
              Great software
              <br />
              connects.
              <br />
              <span>Everything.</span>
            </h2>
            <p>
              Your customers. Your people. Your operations. We build the
              connections that turn separate tools into a stronger business.
            </p>
            <TextLink href="/approach">Discover our approach</TextLink>
          </Reveal>
          <div className="connected-interactive">
            <OrbitCanvas active={active} />
            <div
              className="orbit-service-buttons"
              aria-label="Explore connected business systems"
            >
              {connections.map((c, i) => (
                <button
                  className={`orbit-node node-${i} ${active === i ? "is-active" : ""}`}
                  key={c.label}
                  aria-pressed={active === i}
                  onClick={() => setActive(i)}
                >
                  <Icon name={c.icon} size={17} />
                  {c.label}
                  <span />
                </button>
              ))}
            </div>
            <p className="orbit-instruction">
              <Icon name="plus" size={12} /> SELECT A SYSTEM. SEE THE
              CONNECTION.
            </p>
          </div>
        </div>
        <div className="connection-detail" aria-live="polite">
          <div>
            <h3>{selected.title}</h3>
            <p>{selected.text}</p>
          </div>
          <div className="connection-flow">
            {selected.flow.map((step, i) => (
              <span key={step}>
                {step}
                {i < 2 && <Icon name="arrow" size={15} />}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
