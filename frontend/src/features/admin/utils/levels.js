// How a score level coming from the API (assessment_score_bands.level) is drawn.
// The text on screen is the band label from the API ("Mild autism", "Above cut-off"…); the level only picks colour + arrow.
export const LEVELS = {
  very_low: { name: "Very low", tone: "low", arrow: "down" },
  low: { name: "Low", tone: "low", arrow: "down" },
  normal: { name: "Normal", tone: "normal", arrow: null },
  moderate: { name: "Moderate", tone: "moderate", arrow: "up" },
  high: { name: "High", tone: "high", arrow: "up" },
  very_high: { name: "Very high", tone: "high", arrow: "up" },
};

export const LEVEL_ORDER = ["very_low", "low", "normal", "moderate", "high", "very_high"];

export const levelOf = (level) => LEVELS[level] ?? { name: "", tone: "none", arrow: null };

export const percent = (answered, total) => (total ? Math.round((answered / total) * 100) : 0);

export const inBand = (band, score) => score != null && score >= band.min_score && score <= band.max_score;
