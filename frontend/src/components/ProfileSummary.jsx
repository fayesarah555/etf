const PROFILE_LABELS = {
  prudent: "Profil prudent",
  equilibre: "Profil équilibré",
  dynamique: "Profil dynamique",
};

const RISK_LABELS = {
  low: "Faible",
  medium: "Modéré",
  high: "Élevé",
  very_high: "Très élevé",
};

const HORIZON_LABELS = {
  short: "Court terme",
  medium: "Moyen terme",
  long: "Long terme",
};

const EXPERIENCE_LABELS = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  professional: "Professionnel",
};

function ProfileSummary({
  name,
  email,
  profile,
  riskLevel,
  investmentHorizon,
  experienceLevel,
  sectorPreferences = [],
}) {
  return (
    <article className="profile-card">
      <h3>{PROFILE_LABELS[profile] || profile}</h3>
      <p>
        <strong>{name}</strong>
        <br />
        <span>{email}</span>
      </p>
      <ul>
        <li>
          <strong>Risque :</strong> {RISK_LABELS[riskLevel] || riskLevel}
        </li>
        <li>
          <strong>Horizon :</strong>{" "}
          {HORIZON_LABELS[investmentHorizon] || investmentHorizon}
        </li>
        <li>
          <strong>Expérience :</strong>{" "}
          {EXPERIENCE_LABELS[experienceLevel] || experienceLevel}
        </li>
        <li>
          <strong>Secteurs favoris :</strong>{" "}
          {sectorPreferences.length > 0
            ? sectorPreferences.join(", ")
            : "Sans préférence"}
        </li>
      </ul>
    </article>
  );
}

export default ProfileSummary;
