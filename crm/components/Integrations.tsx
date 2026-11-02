"use client";
import { Notice, Icon, Badge, Panel, useData } from "@sleektech/ui";
export function Integrations() {
  const { data, error } = useData("/messages/config");
  const config = data?.integrations || {};
  return (
    <>
      <Notice error>{error}</Notice>
      <div className="integration-grid">
        {[
          {
            key: "email",
            icon: "messages",
            name: "Business email",
            description:
              "Send reviewed messages through Resend. A verified sending domain keeps communication aligned with your brand.",
            detail: "Delivery, bounce, open and click webhooks",
          },
          {
            key: "whatsapp",
            icon: "whatsapp",
            name: "WhatsApp Business",
            description:
              "Connect the Meta Cloud API for customer conversations, approved templates and delivery updates.",
            detail: "Opt-in and 24-hour reply window enforced",
          },
          {
            key: "ai",
            icon: "sparkles",
            name: "AI writing assistant",
            description:
              "Turn your intent into a considered email draft. Review the subject and message before saving or sending.",
            detail: "OpenAI · credentials stored on the server",
          },
        ].map((item) => (
          <article className="integration-card" key={item.key}>
            <div className="integration-icon">
              <Icon name={item.icon} size={23} />
            </div>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <Badge tone={config[item.key] ? "green" : "amber"}>
              {config[item.key] ? "Configured" : "Setup required"}
            </Badge>
            <footer>{item.detail}</footer>
          </article>
        ))}
      </div>
      <div className="onboarding-note">
        <Icon name="settings" size={23} />
        <div>
          <h3>Connections are managed securely on the backend.</h3>
          <p>
            Your administrator configures provider credentials and webhook
            endpoints. No API keys are exposed in the browser.
          </p>
        </div>
      </div>
      <Panel className="section-space" title="Tracking that keeps its context">
        <div className="panel-body prose">
          Email opens and clicks are engagement signals, not proof of attention.
          Privacy tools and security scanners can generate these events. Track
          delivery and replies independently. WhatsApp free-form replies require
          a recent inbound message; otherwise use an approved template. This
          release supports templates without variable parameters.
        </div>
      </Panel>
    </>
  );
}
