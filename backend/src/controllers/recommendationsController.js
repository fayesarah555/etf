import {
  generateRecommendations,
  getRecommendationsForClient,
} from "../services/recommendationService.js";

export async function listRecommendations(req, res) {
  const { id: clientId } = req.params;
  const recommendations = await getRecommendationsForClient(clientId);
  res.json(recommendations);
}

export async function refreshRecommendations(req, res) {
  const { id: clientId } = req.params;
  const recommendations = await generateRecommendations(clientId);
  res.json(recommendations);
}
