const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 864e5;

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const number = (n) => Number(n).toLocaleString("en-IN");
export const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

export const formatDate = (value) => {
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// "Tue, 17 Nov, 2026"
export const headerDate = (d = new Date()) =>
  `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;

export const daysSince = (value) =>
  Math.round((startOfDay(new Date()) - startOfDay(new Date(value))) / DAY_MS);

export const timeAgo = (value) => {
  const s = (Date.now() - new Date(value).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
