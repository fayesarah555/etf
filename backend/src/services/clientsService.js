import { pool } from "../db/pool.js";

export async function createClient({ name, email, answers }) {
  const sql = `
    INSERT INTO clients
    (name, email, risk_level, investment_horizon, allocation_preference, experience_level,
     stability_focus, max_drawdown_tolerance, liquidity_need, sector_preferences)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name,
    email,
    answers.risk_level,
    answers.investment_horizon,
    answers.allocation_preference,
    answers.experience_level,
    answers.stability_focus,
    answers.max_drawdown_tolerance,
    answers.liquidity_need,
    JSON.stringify(answers.sector_preferences ?? []),
  ];

  const [result] = await pool.query(sql, params);
  return result.insertId;
}

export async function getClientById(clientId) {
  const [rows] = await pool.query(
    `SELECT id, name, email, risk_level, investment_horizon, allocation_preference,
            experience_level, stability_focus, max_drawdown_tolerance, liquidity_need,
            sector_preferences, created_at
     FROM clients WHERE id = ?`,
    [clientId]
  );
  if (!rows[0]) {
    return null;
  }
  const client = rows[0];
  try {
    client.sector_preferences = JSON.parse(client.sector_preferences ?? "[]");
  } catch {
    client.sector_preferences = [];
  }
  return client;
}
