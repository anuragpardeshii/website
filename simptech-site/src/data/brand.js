// Two opposing, precisely spaced ribbons form the SleekTech S.
// Shared by the website, favicons, downloadable assets, and social card.
export const brandMarkPath = "M17 4H44L34 14H21L16 19H26L16 29H4V17L17 4Z";

export function brandMarkSvg({
  color = "#185bf1",
  background = "",
  inset = 0,
  cornerRadius = 11,
} = {}) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
    (background
      ? '<rect width="48" height="48" rx="' +
        cornerRadius +
        '" fill="' +
        background +
        '"/>'
      : "") +
    '<g fill="' +
    color +
    '"' +
    (inset
      ? ' transform="translate(' +
        inset +
        " " +
        inset +
        ") scale(" +
        (48 - inset * 2) / 48 +
        ')"'
      : "") +
    '><path d="' +
    brandMarkPath +
    '"/><path d="' +
    brandMarkPath +
    '" transform="rotate(180 24 24)"/></g></svg>'
  );
}
