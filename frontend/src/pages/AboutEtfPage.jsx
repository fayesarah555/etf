function AboutEtfPage() {
  return (
    <section className="education-card">
      <header>
        <h1>Comprendre les ETF</h1>
        <p>
          Un ETF (Exchange Traded Fund) est un fonds coté en bourse qui suit un
          indice, un secteur ou un panier d’actifs. Il se négocie comme une
          action, mais offre la diversification d’un fonds commun.
        </p>
      </header>

      <article className="education-section">
        <h2>Pourquoi les ETF intéressent les investisseurs&nbsp;?</h2>
        <ul className="education-list">
          <li>
            <strong>Diversification :</strong> en achetant un seul ETF, vous
            accédez à des dizaines voire centaines de titres.
          </li>
          <li>
            <strong>Coûts réduits :</strong> la gestion est passive, les frais
            annuels sont donc souvent inférieurs à 0,5&nbsp;%.
          </li>
          <li>
            <strong>Liquidité :</strong> l’ETF se négocie toute la journée au
            prix de marché, comme une action.
          </li>
          <li>
            <strong>Transparence :</strong> la composition suit un indice
            public, vous savez précisément ce que contient le fonds.
          </li>
        </ul>
      </article>

      <article className="education-section">
        <h2>Comment lire les champs présentés dans l’application&nbsp;?</h2>
        <dl className="education-dictionary">
          <div>
            <dt>Symbole</dt>
            <dd>
              Code unique de l’ETF sur la bourse (ex&nbsp;: <em>VOO</em> pour
              Vanguard S&amp;P 500).
            </dd>
          </div>
          <div>
            <dt>Nom</dt>
            <dd>
              Intitulé commercial du fonds et parfois l’indice qu’il suit
              (ex&nbsp;: <em>iShares Core MSCI World UCITS ETF</em>).
            </dd>
          </div>
          <div>
            <dt>Prix</dt>
            <dd>
              Cours instantané de l’ETF exprimé en dollars, tel qu’il cote en
              bourse.
            </dd>
          </div>
          <div>
            <dt>Variation ($)</dt>
            <dd>
              Différence de prix (en dollars) par rapport à la clôture de la
              séance précédente.
            </dd>
          </div>
          <div>
            <dt>Variation (%)</dt>
            <dd>
              Même information mais rapportée en pourcentage, utile pour comparer
              la volatilité d’un ETF à un autre.
            </dd>
          </div>
          <div>
            <dt>Volume</dt>
            <dd>
              Nombre de parts échangées depuis l’ouverture du marché. Un volume
              élevé garantit des transactions plus faciles (plus de liquidité).
            </dd>
          </div>
        </dl>
      </article>

      <article className="education-section">
        <h2>Construire son portefeuille avec des ETF</h2>
        <p>
          L’application vous propose des ETF en fonction de votre profil
          investisseur (tolérance au risque, horizon d’investissement, secteurs
          favoris). Les recommandations ne sont pas des conseils personnalisés
          mais une base de réflexion. Pensez à diversifier vos placements et à
          réévaluer votre stratégie régulièrement.
        </p>
      </article>
    </section>
  );
}

export default AboutEtfPage;
