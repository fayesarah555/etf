function RecommendationsList({
  recommendations = [],
  onRefresh,
  refreshing,
  predictions = {},
  predictionLoading = false,
  predictionError = null,
}) {
  return (
    <section className="card">
      <header className="card-header">
        <h3>Recommandations personnalisées</h3>
        {onRefresh && (
          <button
            type="button"
            className="secondary-button"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Mise à jour..." : "Rafraîchir"}
          </button>
        )}
      </header>
      {predictionLoading && (
        <p className="muted-text">Calcul des probabilités de hausse...</p>
      )}
      {predictionError && (
        <div className="error-banner">{predictionError}</div>
      )}
      {recommendations.length === 0 ? (
        <p>Aucune recommandation disponible.</p>
      ) : (
        <ul className="recommendation-list">
          {recommendations.map((item) => (
            <li key={item.id} className="recommendation-item">
              <div className="recommendation-header">
                <div>
                  <span className="ticker">{item.etf.symbol}</span>
                  <strong>{item.etf.name}</strong>
                </div>
                <span className="score">
                  {(item.score * 100).toFixed(0)}
                  <small>/100</small>
                </span>
              </div>
              <dl>
                <div>
                  <dt>Prix</dt>
                  <dd>{Number(item.etf.price).toFixed(2)} $</dd>
                </div>
                <div>
                  <dt>Variation</dt>
                  <dd>
                    {Number(item.etf.priceChange).toFixed(2)} (
                    {Number(item.etf.changePercent).toFixed(2)}%)
                  </dd>
                </div>
                <div>
                  <dt>Volume</dt>
                  <dd>{Number(item.etf.volume).toLocaleString("fr-FR")}</dd>
                </div>
                {typeof predictions[item.etf.symbol] === "number" && (
                  <div>
                    <dt>Probabilité 30 j</dt>
                    <dd>
                      {(predictions[item.etf.symbol] * 100).toFixed(0)} %
                    </dd>
                  </div>
                )}
              </dl>
              {item.rationale?.triggers && (
                <div className="rationale">
                  {item.rationale.triggers.map((trigger, index) => (
                    <span key={index} className="tag">
                      {trigger}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecommendationsList;
