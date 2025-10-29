import { pool } from "../db/pool.js";

export async function getAllEtfs() {
  const [rows] = await pool.query(
    "SELECT id, symbol, name, price, price_change, change_percent, volume FROM etfs ORDER BY symbol ASC"
  );
  return rows;
}

export async function getEtfById(etfId) {
  const [rows] = await pool.query(
    "SELECT id, symbol, name, price, price_change, change_percent, volume FROM etfs WHERE id = ?",
    [etfId]
  );
  return rows[0] ?? null;
}
