import { brandMarkPath } from "../data/brand";

export function BrandMark({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={brandMarkPath} />
      <path d={brandMarkPath} transform="rotate(180 24 24)" />
    </svg>
  );
}
