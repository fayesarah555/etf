import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

const DEFAULT_FORM_STATE = {
  name: "",
  email: "",
  risk_tolerance: "medium",
  investment_horizon: "medium",
  allocation_preference: "btw_10_25",
  experience_level: "beginner",
  stability_focus: "balanced_income",
  drawdown_tolerance: "up_to_5",
  liquidity_need: "months",
  sector_preferences: [],
};

const QUESTION_OPTIONS = {
  risk_tolerance: [
    { value: "low", label: "Faible" },
    { value: "medium", label: "Modérée" },
    { value: "high", label: "Élevée" },
    { value: "very_high", label: "Très élevée" },
  ],
  investment_horizon: [
    { value: "short", label: "Court terme (< 2 ans)" },
    { value: "medium", label: "Moyen terme (2-5 ans)" },
    { value: "long", label: "Long terme (> 5 ans)" },
  ],
  allocation_preference: [
    { value: "lt_10", label: "< 10 %" },
    { value: "btw_10_25", label: "10 - 25 %" },
    { value: "btw_25_50", label: "25 - 50 %" },
    { value: "gt_50", label: "> 50 %" },
  ],
  experience_level: [
    { value: "beginner", label: "Débutant" },
    { value: "intermediate", label: "Intermédiaire" },
    { value: "advanced", label: "Avancé" },
    { value: "professional", label: "Professionnel" },
  ],
  stability_focus: [
    { value: "capital_preservation", label: "Capital garanti" },
    { value: "balanced_income", label: "Rendement régulier" },
    { value: "growth", label: "Rendement élevé malgré volatilité" },
  ],
  drawdown_tolerance: [
    { value: "none", label: "Aucune" },
    { value: "up_to_5", label: "Jusqu'à 5 %" },
    { value: "up_to_15", label: "Jusqu'à 15 %" },
    { value: "above_15", label: "Plus de 15 %" },
  ],
  liquidity_need: [
    { value: "immediate", label: "Accès immédiat" },
    { value: "months", label: "Accès en quelques mois" },
    { value: "years", label: "Pas de besoin avant plusieurs années" },
  ],
  sector_preferences: [
    { value: "Technologie", label: "Technologie" },
    { value: "Sante", label: "Santé" },
    { value: "Energie", label: "Énergie" },
    { value: "Financier", label: "Financier" },
    { value: "Industrial", label: "Industrie" },
    { value: "Consommation", label: "Consommation" },
  ],
};

function QuestionnairePage() {
  const [questions, setQuestions] = useState([]);
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/questionnaire")
      .then((response) => setQuestions(response.data))
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les questions.");
      });
  }, []);

  const questionList = useMemo(
    () => questions.filter((question) => QUESTION_OPTIONS[question.code]),
    [questions]
  );

  const handleFieldChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSectorPreference = (value) => {
    setFormState((prev) => {
      const exists = prev.sector_preferences.includes(value);
      return {
        ...prev,
        sector_preferences: exists
          ? prev.sector_preferences.filter((item) => item !== value)
          : [...prev.sector_preferences, value],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formState.name,
        email: formState.email,
        answers: {
          risk_tolerance: formState.risk_tolerance,
          investment_horizon: formState.investment_horizon,
          allocation_preference: formState.allocation_preference,
          experience_level: formState.experience_level,
          stability_focus: formState.stability_focus,
          drawdown_tolerance: formState.drawdown_tolerance,
          liquidity_need: formState.liquidity_need,
          sector_preferences: formState.sector_preferences,
        },
        questionnaireAnswers: questionList.map((question) => ({
          question_code: question.code,
          answer:
            question.code === "sector_preferences"
              ? formState.sector_preferences
              : formState[question.code],
        })),
      };

      const response = await apiClient.post("/clients", payload);
      const { id, profile, recommendations } = response.data;

      sessionStorage.setItem(
        "clientContext",
        JSON.stringify({ id, profile })
      );
      sessionStorage.setItem(
        "clientRecommendations",
        JSON.stringify(recommendations)
      );

      navigate("/dashboard", {
        state: { clientId: id, profile, recommendations },
      });
    } catch (submitError) {
      console.error(submitError);
      setError("Envoi impossible. Merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Questionnaire investisseur</h2>
      <p className="section-intro">
        Ces questions nous permettent de dresser votre profil investisseur
        afin de proposer des ETF adaptés à vos objectifs.
      </p>
      {error && <div className="error-banner">{error}</div>}
      <form className="questionnaire-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom</label>
          <input
            id="name"
            type="text"
            value={formState.name}
            onChange={(event) =>
              handleFieldChange("name", event.target.value)
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formState.email}
            onChange={(event) =>
              handleFieldChange("email", event.target.value)
            }
            required
          />
        </div>

        {questionList.map((question) => {
          const options = QUESTION_OPTIONS[question.code];
          if (!options) {
            return null;
          }

          if (question.code === "sector_preferences") {
            return (
              <fieldset
                key={question.id}
                className="form-group form-group--checkbox"
              >
                <legend>{question.questionText}</legend>
                <div className="checkbox-grid">
                  {options.map((option) => (
                    <label key={option.value} className="checkbox-option">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={formState.sector_preferences.includes(
                          option.value
                        )}
                        onChange={() => toggleSectorPreference(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          }

          return (
            <div key={question.id} className="form-group">
              <label htmlFor={question.code}>{question.questionText}</label>
              <select
                id={question.code}
                value={formState[question.code]}
                onChange={(event) =>
                  handleFieldChange(question.code, event.target.value)
                }
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <button
          type="submit"
          className="primary-button"
          disabled={submitting}
        >
          {submitting ? "Analyse en cours..." : "Obtenir mes recommandations"}
        </button>
      </form>
    </section>
  );
}

export default QuestionnairePage;
