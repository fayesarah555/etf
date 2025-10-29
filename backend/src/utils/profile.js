const RISK_POINTS = {
  low: 0,
  medium: 1,
  high: 2,
  very_high: 3,
};

const ALLOCATION_POINTS = {
  lt_10: 0,
  btw_10_25: 1,
  btw_25_50: 2,
  gt_50: 3,
};

const STABILITY_POINTS = {
  capital_preservation: 0,
  balanced_income: 1,
  growth: 3,
};

const DRAWDOWN_POINTS = {
  none: 0,
  up_to_5: 1,
  up_to_15: 2,
  above_15: 3,
};

const HORIZON_POINTS = {
  short: 0,
  medium: 1,
  long: 2,
};

const LIQUIDITY_POINTS = {
  immediate: 0,
  months: 1,
  years: 2,
};

const EXPERIENCE_POINTS = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  professional: 3,
};

export function computeProfileScores(answers) {
  const riskValues = [
    RISK_POINTS[answers.risk_tolerance] ?? 0,
    ALLOCATION_POINTS[answers.allocation_preference] ?? 0,
    STABILITY_POINTS[answers.stability_focus] ?? 0,
    DRAWDOWN_POINTS[answers.drawdown_tolerance] ?? 0,
  ];

  const horizonValues = [
    HORIZON_POINTS[answers.investment_horizon] ?? 0,
    LIQUIDITY_POINTS[answers.liquidity_need] ?? 0,
  ];

  const riskScore =
    riskValues.reduce((sum, value) => sum + value, 0) / riskValues.length;
  const horizonScore =
    horizonValues.reduce((sum, value) => sum + value, 0) / horizonValues.length;
  const experienceScore = EXPERIENCE_POINTS[answers.experience_level] ?? 0;

  const profile =
    riskScore < 1 && horizonScore <= 0.5
      ? "prudent"
      : riskScore >= 2 || horizonScore > 1.5
      ? "dynamique"
      : "equilibre";

  const experienceTier =
    experienceScore <= 1
      ? "novice"
      : experienceScore === 2
      ? "confirme"
      : "expert";

  return {
    riskScore,
    horizonScore,
    experienceScore,
    profile,
    experienceTier,
  };
}

export function normalizeSectorPreferences(preferences = []) {
  if (!Array.isArray(preferences) || preferences.length === 0) {
    return [];
  }
  return preferences
    .map((pref) => String(pref).trim())
    .filter((pref) => pref.length > 0 && pref.toLowerCase() !== "sans preference");
}

export function mapAnswersToClientRow(answers) {
  return {
    risk_level: answers.risk_tolerance ?? "low",
    investment_horizon: answers.investment_horizon ?? "short",
    allocation_preference: answers.allocation_preference ?? "lt_10",
    experience_level: answers.experience_level ?? "beginner",
    stability_focus: answers.stability_focus ?? "capital_preservation",
    max_drawdown_tolerance: answers.drawdown_tolerance ?? "none",
    liquidity_need: answers.liquidity_need ?? "immediate",
    sector_preferences: normalizeSectorPreferences(
      answers.sector_preferences ?? []
    ),
  };
}
