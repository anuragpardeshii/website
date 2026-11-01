import { Icon } from "./ui";

export function AIServicePreview({
  mode,
  className = "",
}: {
  mode: string;
  className?: string;
}) {
  const chatbot = mode === "chatbot";
  return (
    <div
      className={`ai-service-preview ${className}`}
      role="img"
      aria-label={`${chatbot ? "Customer support chatbot" : "Business AI engine"} interface concept; all sources and responses are illustrative`}
    >
      <div className="ai-preview-bar">
        <span>
          <Icon name={chatbot ? "message" : "sparkle"} size={17} />
          {chatbot
            ? "SimpTech / Customer assistant"
            : "SimpTech / Intelligence engine"}
        </span>
        <small>CONCEPT</small>
      </div>
      {chatbot ? (
        <div className="chat-preview-body">
          <div className="chat-preview-heading">
            <Icon name="message" size={26} />
            <h3>A helpful place to begin.</h3>
            <p>Answers grounded in your business.</p>
          </div>
          <div className="chat-sample-question">
            Can I connect my store to my inventory?
          </div>
          <div className="chat-sample-answer">
            <span>
              <Icon name="sparkle" size={14} /> CUSTOMER ASSISTANT
            </span>
            <p>
              We can explore a shared inventory workflow for your store and
              operations team. The right approach depends on your existing
              tools.
            </p>
            <div>
              <Icon name="book" size={12} /> Source · Integration guide
            </div>
          </div>
          <div className="chat-human">
            <Icon name="users" size={14} />
            <span>A specialist can help with the details.</span>
          </div>
        </div>
      ) : (
        <div className="engine-preview-body">
          <div className="ai-preview-title">
            <span>KNOWLEDGE → CONTEXT → ACTION</span>
            <h3>Connected intelligence.</h3>
            <p>Your information. A considered workflow.</p>
          </div>
          <div className="engine-preview-flow">
            <div>
              <Icon name="book" size={21} />
              <span>KNOWLEDGE</span>
            </div>
            <i />
            <div className="engine-preview-core">
              <Icon name="sparkle" size={30} />
            </div>
            <i />
            <div>
              <Icon name="shield" size={21} />
              <span>REVIEW</span>
            </div>
          </div>
          <div className="engine-preview-steps">
            {[
              ["01", "Find the relevant context", "Approved business sources"],
              [
                "02",
                "Prepare a grounded response",
                "Source references included",
              ],
              [
                "03",
                "Hand the decision to your team",
                "Review before taking action",
              ],
            ].map(([n, title, detail]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
                <Icon name="check" size={14} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="ai-preview-footer">
        <span>ORIGINAL INTERFACE EXPLORATION</span>
        <span>ILLUSTRATIVE DATA</span>
      </div>
    </div>
  );
}
