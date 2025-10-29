import {
  getQuestions,
  insertClientAnswers,
} from "../services/questionnaireService.js";

export async function listQuestions(req, res) {
  const questions = await getQuestions();
  res.json(questions);
}

export async function saveAnswers(req, res) {
  const { clientId, answers } = req.body;
  if (!clientId) {
    return res.status(400).json({ message: "clientId requis" });
  }
  await insertClientAnswers(clientId, answers);
  res.status(204).send();
}
