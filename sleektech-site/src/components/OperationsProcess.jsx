import {
  Check,
  Package,
  CreditCard,
  Truck,
  FileCheck2,
  Users,
  Landmark,
} from "lucide-react";

export function OperationsProcess({ mode, time }) {
  const progress = Math.min(1, time / 11200);
  if (mode === "logistics") {
    // The marker follows the same two route segments as the drawn SVG path.
    const route = Math.min(1, Math.max(0, (time - 5600) / 4800));
    const x = route < 0.5 ? 28 + route * 244 : 150 + (route - 0.5) * 244;
    const y = route < 0.5 ? 48 - route * 48 : 24 + (route - 0.5) * 48;
    return (
      <div className="wb-operations-process wb-dispatch-map">
        <div>
          <span>DELIVERY NETWORK</span>
          <strong>
            {route === 1
              ? "Delivery confirmed"
              : time < 5600
                ? "Preparing dispatch"
                : "Shipment in motion"}
          </strong>
        </div>
        <svg viewBox="0 0 300 76" aria-hidden="true">
          <path
            d="M0 16H300M0 40H300M0 64H300M50 0V76M100 0V76M150 0V76M200 0V76M250 0V76"
            stroke="#e8edf5"
            fill="none"
          />
          <path
            d="M28 48L150 24L272 48"
            stroke="#cdd9ee"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M28 48L150 24L272 48"
            stroke="#185bf1"
            strokeWidth="3"
            fill="none"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - route}
          />
          {[
            [28, 48, "Warehouse"],
            [150, 24, "Transit hub"],
            [272, 48, "Customer"],
          ].map(([cx, cy, label]) => (
            <g key={label}>
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill="white"
                stroke="#185bf1"
                strokeWidth="2"
              />
              <text x={cx} y={cy + 17} textAnchor="middle">
                {label}
              </text>
            </g>
          ))}
          <circle cx={x} cy={y} r="9" fill="#185bf1" fillOpacity=".15" />
          <circle cx={x} cy={y} r="4" fill="#185bf1" />
        </svg>
      </div>
    );
  }
  const nodes =
    mode === "commerce"
      ? [
          [CreditCard, "Payment", "Authorized"],
          [Package, "Warehouse", "Packed"],
          [Truck, "Carrier", "Confirmed"],
        ]
      : [
          [Users, "Department", "Approved"],
          [FileCheck2, "Procurement", "PO created"],
          [Landmark, "Finance", "Reconciled"],
        ];
  return (
    <div className="wb-operations-process">
      <div>
        <span>
          {mode === "commerce"
            ? "ORDER ORCHESTRATION"
            : "APPROVAL & RECONCILIATION"}
        </span>
        <strong>
          {progress === 1
            ? "All records synchronized"
            : "Connecting teams and systems"}
        </strong>
      </div>
      <div className="wb-process-nodes">
        <div className="wb-process-connection">
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
        {nodes.map(([Symbol, label, status], index) => {
          const done = progress >= (index + 1) / 3;
          return (
            <div key={label} className={done ? "is-done" : ""}>
              <span>{done ? <Check size={13} /> : <Symbol size={13} />}</span>
              <b>{label}</b>
              <small>
                {done
                  ? status
                  : index <= progress * 3
                    ? "Processing"
                    : "Queued"}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
