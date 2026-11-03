// Folded ribbon S, recreated as vector geometry from the approved logo reference.
// One source supplies the inline mark, exports, browser icons and social card.
export const brandMarkTransform = "translate(-4 -5.6) scale(.2)";
export const brandMarkLayers = [
  {
    name: "fold",
    path: "M80 149L156 191L225 153L225 145L219 139L159 106L91 141Q80 146 80 149Z",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "80%",
    stops: [
      ["0%", "#06105b"],
      ["55%", "#10158d"],
      ["100%", "#2411ad"],
    ],
  },
  {
    name: "lower",
    path: "M40 247C54 227 64 217 84 207L207 149Q221 143 219 139C237 150 243 164 235 182C230 194 221 201 208 208L134 242Q122 247 109 247Z",
    x1: "0%",
    y1: "100%",
    x2: "100%",
    y2: "0%",
    stops: [
      ["0%", "#27c5f3"],
      ["43%", "#137cff"],
      ["100%", "#4014f4"],
    ],
  },
  {
    name: "upper",
    path: "M80 149C58 139 54 119 69 100C75 92 82 88 94 82L155 53Q168 48 182 48H242C229 68 220 77 202 86L92 142Q81 147 80 149Z",
    x1: "0%",
    y1: "100%",
    x2: "100%",
    y2: "0%",
    stops: [
      ["0%", "#311bff"],
      ["47%", "#247bff"],
      ["100%", "#5bc3ff"],
    ],
  },
];

export function brandMarkSvg({
  color,
  background = "",
  inset = 0,
  cornerRadius = 0,
  id = "sleektech-ribbon",
} = {}) {
  const defs = color
    ? ""
    : `<defs>${brandMarkLayers
        .map(
          (layer) =>
            `<linearGradient id="${id}-${layer.name}" x1="${layer.x1}" y1="${layer.y1}" x2="${layer.x2}" y2="${layer.y2}">${layer.stops.map(([offset, fill]) => `<stop offset="${offset}" stop-color="${fill}"/>`).join("")}</linearGradient>`,
        )
        .join("")}</defs>`;
  const backdrop = background
    ? `<rect width="48" height="48" rx="${cornerRadius}" fill="${background}"/>`
    : "";
  const transform = `translate(${inset} ${inset}) scale(${(48 - inset * 2) / 48})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${backdrop}${defs}<g transform="${transform}"><g transform="${brandMarkTransform}">${brandMarkLayers.map((layer) => `<path d="${layer.path}" fill="${color || `url(#${id}-${layer.name})`}"/>`).join("")}</g></g></svg>`;
}
