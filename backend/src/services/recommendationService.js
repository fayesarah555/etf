import { pool } from "../db/pool.js";
import { getAllEtfs } from "./etfsService.js";
import { getClientById } from "./clientsService.js";
import {
  computeProfileScores,
  normalizeSectorPreferences,
} from "../utils/profile.js";

export async function generateRecommendations(clientId) {
  const client = await getClientById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  const answers = {
    risk_tolerance: client.risk_level,
    investment_horizon: client.investment_horizon,
    allocation_preference: client.allocation_preference,
    experience_level: client.experience_level,
    stability_focus: client.stability_focus,
    drawdown_tolerance: client.max_drawdown_tolerance,
    liquidity_need: client.liquidity_need,
    sector_preferences: client.sector_preferences ?? [],
  };

  const profileScores = computeProfileScores(answers);
  const etfs = await getAllEtfs();

  const scored = etfs
    .map((etf) => {
      const metrics = computeEtfMetrics(etf);
      const { score, rationale } = scoreEtf(
        metrics,
        profileScores,
        normalizeSectorPreferences(answers.sector_preferences)
      );
      return {
        etfId: etf.id,
        score,
        rationale,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  await persistRecommendations(clientId, scored);

  return getRecommendationsForClient(clientId);
}

export async function getRecommendationsForClient(clientId) {
  const [rows] = await pool.query(
    `SELECT r.id, r.client_id AS clientId, r.score, r.rationale,
            e.id AS etfId, e.symbol, e.name, e.price, e.price_change AS priceChange,
            e.change_percent AS changePercent, e.volume
     FROM recommendations r
     JOIN etfs e ON e.id = r.etf_id
     WHERE r.client_id = ?
     ORDER BY r.score DESC`,
    [clientId]
  );

  return rows.map((row) => ({
    id: row.id,
    clientId: row.clientId,
    etf: {
      id: row.etfId,
      symbol: row.symbol,
      name: row.name,
      price: Number(row.price),
      priceChange: Number(row.priceChange),
      changePercent: Number(row.changePercent),
      volume: Number(row.volume),
    },
    score: Number(row.score),
    rationale: safeParseJson(row.rationale),
  }));
}

async function persistRecommendations(clientId, recommendations) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM recommendations WHERE client_id = ?", [
      clientId,
    ]);

    for (const recommendation of recommendations) {
      await connection.query(
        `INSERT INTO recommendations (client_id, etf_id, score, rationale)
         VALUES (?, ?, ?, ?)`,
        [
          clientId,
          recommendation.etfId,
          recommendation.score,
          JSON.stringify(recommendation.rationale),
        ]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function computeEtfMetrics(etf) {
  const changePercent = Math.abs(Number(etf.change_percent) || 0);
  const priceChange = Math.abs(Number(etf.price_change) || 0);
  const volume = Number(etf.volume) || 0;
  const name = etf.name ?? "";
  return {
    ...etf,
    changePercent,
    priceChange,
    volume,
    name,
  };
}

function scoreEtf(etf, profileScores, sectorPreferences) {
  let score = 0;
  const triggers = [];

  if (profileScores.profile === "prudent") {
    if (etf.changePercent <= 1.5) {
      score += 0.4;
      triggers.push("Volatilite faible");
    }
    if (etf.volume >= 500_000) {
      score += 0.2;
      triggers.push("Volume eleve");
    }
    if (etf.priceChange <= 0.5) {
      score += 0.1;
      triggers.push("Variation quotidienne limitee");
    }
  } else if (profileScores.profile === "equilibre") {
    if (etf.changePercent <= 3) {
      score += 0.3;
      triggers.push("Volatilite moderee");
    }
    if (etf.volume >= 300_000) {
      score += 0.2;
      triggers.push("Liquidite confortable");
    }
  } else if (profileScores.profile === "dynamique") {
    if (etf.changePercent >= 1) {
      score += 0.2;
      triggers.push("Potentiel de gains");
    }
    if (etf.volume >= 200_000) {
      score += 0.1;
      triggers.push("Volume satisfaisant");
    }
    if (etf.changePercent >= 3) {
      score += 0.2;
      triggers.push("Volatilite assumee");
    }
  }

  if (profileScores.horizonScore >= 1.5 && etf.volume >= 1_000_000) {
    score += 0.1;
    triggers.push("Adapte au long terme");
  } else if (profileScores.horizonScore <= 0.5 && etf.volume >= 800_000) {
    score += 0.1;
    triggers.push("Liquidite rapide");
  }

  if (profileScores.experienceTier === "novice" && etf.changePercent <= 2) {
    score += 0.1;
    triggers.push("Compatible experience novice");
  } else if (
    profileScores.experienceTier === "expert" &&
    etf.changePercent >= 2
  ) {
    score += 0.1;
    triggers.push("Profil expert");
  }

  const matchedSectors = matchSectors(etf.name, sectorPreferences);
  if (matchedSectors.length > 0) {
    const ratio = matchedSectors.length / sectorPreferences.length;
    const sectorScore = 0.3 * ratio;
    score += sectorScore;
    triggers.push(`Secteurs: ${matchedSectors.join(", ")}`);
  } else if (sectorPreferences.length === 0) {
    score += 0.1;
    triggers.push("Sans preference sectorielle");
  }

  const normalizedScore = Math.min(score, 1);
  return {
    score: normalizedScore,
    rationale: {
      profile: profileScores.profile,
      triggers,
      metrics: {
        changePercent: etf.changePercent,
        priceChange: etf.priceChange,
        volume: etf.volume,
      },
    },
  };
}

function matchSectors(etfName, sectorPreferences) {
  if (!sectorPreferences || sectorPreferences.length === 0) {
    return [];
  }
  const normalizedName = etfName.toLowerCase();
  return sectorPreferences.filter((sector) =>
    normalizedName.includes(sector.toLowerCase())
  );
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
