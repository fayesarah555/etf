import { getAllEtfs, getEtfById } from "../services/etfsService.js";

export async function listEtfs(req, res) {
  const etfs = await getAllEtfs();
  res.json(etfs);
}

export async function getEtf(req, res) {
  const etf = await getEtfById(req.params.id);
  if (!etf) {
    return res.status(404).json({ message: "ETF introuvable" });
  }
  res.json(etf);
}
