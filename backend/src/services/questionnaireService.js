import { pool } from "../db/pool.js";

export async function getQuestions() {
  const [rows] = await pool.query(
    "SELECT id, code, question_text AS questionText, question_type AS questionType, possible_answers AS possibleAnswers FROM questionnaire ORDER BY id ASC"
  );

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    questionText: row.questionText,
    questionType: row.questionType,
    possibleAnswers: safeParseJson(row.possibleAnswers),
  }));
}

export async function insertClientAnswers(clientId, answers = []) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return;
  }

  const codes = answers.map((entry) => entry.question_code);
  const [rows] = await pool.query(
    `SELECT id, code FROM questionnaire WHERE code IN (${codes
      .map(() => "?")
      .join(",")})`,
    codes
  );

  const codeToId = new Map(rows.map((row) => [row.code, row.id]));

  const filteredAnswers = answers
    .map((entry) => {
      const questionId = codeToId.get(entry.question_code);
      if (!questionId) {
        return null;
      }
      return {
        clientId,
        questionId,
        answerPayload: JSON.stringify(entry.answer),
      };
    })
    .filter(Boolean);

  if (filteredAnswers.length === 0) {
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const answer of filteredAnswers) {
      await connection.query(
        "INSERT INTO answers (client_id, question_id, answer_payload) VALUES (?, ?, ?)",
        [answer.clientId, answer.questionId, answer.answerPayload]
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

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
