# Client profiling and recommendation scoring

This note explains how to translate questionnaire answers into a client profile, and how to map that profile to ETF recommendations.

## 1. Scoring framework

Each single-choice question contributes to three axes:

| Question code          | Axis               | Points per answer |
|------------------------|--------------------|-------------------|
| risk_tolerance         | Risk appetite      | Faible = 0, Moderee = 1, Elevee = 2, Tres elevee = 3 |
| investment_horizon     | Horizon            | Court terme = 0, Moyen terme = 1, Long terme = 2 |
| allocation_preference  | Risk appetite      | <10 % = 0, 10-25 % = 1, 25-50 % = 2, >50 % = 3 |
| experience_level       | Experience         | Debutant = 0, Intermediaire = 1, Avance = 2, Professionnel = 3 |
| stability_focus        | Risk appetite      | Capital garanti = 0, Rendement modere et regulier = 1, Rendement potentiel eleve avec volatilite = 3 |
| drawdown_tolerance     | Risk appetite      | Aucune = 0, Jusqu'a 5 % = 1, Jusqu'a 15 % = 2, Plus de 15 % = 3 |
| liquidity_need         | Horizon            | Acces immediat = 0, Acces en quelques mois = 1, Pas de besoin avant plusieurs annees = 2 |

Derived metrics:

```
risk_score = average(points for risk_tolerance, allocation_preference, stability_focus, drawdown_tolerance)
horizon_score = average(points for investment_horizon, liquidity_need)
experience_score = points for experience_level
```

Profile classification:

- Prudent: risk_score < 1 and horizon_score <= 0.5
- Equilibre: 1 <= risk_score < 2 or horizon_score between 0.5 and 1.5
- Dynamique: risk_score >= 2 or horizon_score > 1.5

Experience tiers:

- novice: experience_score <= 1
- confirme: experience_score = 2
- expert: experience_score = 3

## 2. Sector preferences

The `sector_preferences` answer produces a list of target keywords. If "Sans preference" is selected, treat as wildcard.

## 3. ETF matching heuristics

Computed fields needed from scraped ETFs:

- Daily change percent (parsed as float)
- Volume (numeric)
- Keyword matches in `name` for sectors

Scoring formula per ETF:

```
score = 0

-- Base alignment with risk profile
if profile == 'Prudent':
    if change_percent_abs <= 1.5 then score += 0.4
    if volume_numeric >= 500000 then score += 0.2
    if price_change_abs <= 0.5 then score += 0.1

if profile == 'Equilibre':
    if change_percent_abs <= 3 then score += 0.3
    if volume_numeric >= 300000 then score += 0.2

if profile == 'Dynamique':
    if change_percent_abs >= 1 then score += 0.2
    if volume_numeric >= 200000 then score += 0.1
    if change_percent_abs >= 3 then score += 0.2

-- Horizon adjustments
if horizon_score >= 1.5 and volume_numeric >= 1000000: score += 0.1
if horizon_score <= 0.5 and volume_numeric >= 800000: score += 0.1

-- Experience adjustments
if experience tier == 'novice' and change_percent_abs <= 2: score += 0.1
if experience tier == 'expert' and change_percent_abs >= 2: score += 0.1

-- Sector preference boost
match_ratio = number of preferred sectors found in ETF name / max(1, preferred sector count)
score += 0.3 * match_ratio
```

Normalize final score to [0,1] by `min(score, 1.0)` and keep top 5 ETFs per client.

Store scoring components in `recommendations.rationale` as JSON (for example: `{"profile":"Equilibre","matches":["Technologie"],"volume":1200000}`) to allow explanation in the UI.

## 4. Implementation checklist

1. Insert questions with `database/questionnaire_seed.sql`.
2. Expose API to fetch questions and record answers.
3. After collecting a client's responses, compute the profile using the formulas above and persist it in the `clients` table.
4. Run the ETF matching logic and upsert the best candidates into `recommendations` with the calculated score and rationale.

This structure keeps the rules transparent and easy to adjust as you tighten the recommendation model.
