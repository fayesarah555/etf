import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="home-hero">
      <h1>Construisez votre profil investisseur ETF</h1>
      <p>
        Répondez à quelques questions clés pour découvrir une sélection d&apos;ETF
        alignée avec votre tolérance au risque, votre horizon d&apos;investissement
        et vos préférences sectorielles.
      </p>
      <Link to="/questionnaire" className="primary-button">
        Commencer le questionnaire
      </Link>
    </section>
  );
}

export default HomePage;
