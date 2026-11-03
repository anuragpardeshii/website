import { useId } from "react";
import { brandMarkLayers, brandMarkTransform } from "../data/brand";

export function BrandMark({ className = "" }) {
  const id = "sleektech-ribbon-" + useId().replace(/:/g, "");
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {brandMarkLayers.map((layer) => (
          <linearGradient
            key={layer.name}
            id={id + "-" + layer.name}
            x1={layer.x1}
            y1={layer.y1}
            x2={layer.x2}
            y2={layer.y2}
          >
            {layer.stops.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        ))}
      </defs>
      <g transform={brandMarkTransform}>
        {brandMarkLayers.map((layer) => (
          <path
            key={layer.name}
            d={layer.path}
            fill={`url(#${id}-${layer.name})`}
          />
        ))}
      </g>
    </svg>
  );
}
