import {
  createClient,
  getClientById,
} from "../services/clientsService.js";
import { insertClientAnswers } from "../services/questionnaireService.js";
import { generateRecommendations } from "../services/recommendationService.js";
import {
  mapAnswersToClientRow,
  computeProfileScores,
} from "../utils/profile.js";

export async function createClientProfile(req, res) {
  const { name, email, answers, questionnaireAnswers = [] } = req.body;
  if (!name || !email || !answers) {
    return res
      .status(400)
      .json({ message: "name, email et answers sont obligatoires" });
  }

  const normalizedAnswers = mapAnswersToClientRow(answers);
  const insertId = await createClient({
    name,
    email,
    answers: normalizedAnswers,
  });

  if (questionnaireAnswers.length > 0) {
    await insertClientAnswers(insertId, questionnaireAnswers);
  }

  const profileScores = computeProfileScores({
    ...answers,
    sector_preferences: normalizedAnswers.sector_preferences,
  });

  const recommendations = await generateRecommendations(insertId);

  res.status(201).json({
    id: insertId,
    profile: profileScores.profile,
    scores: profileScores,
    recommendations,
  });
}

export async function getClientProfile(req, res) {
  const client = await getClientById(req.params.id);
  if (!client) {
    return res.status(404).json({ message: "Client introuvable" });
  }
  res.json(client);
}
