function EtfTable({ etfs = [] }) {
  return (
    <section className="card">
      <header className="card-header">
        <h3>Liste des ETF disponibles</h3>
      </header>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Symbole</th>
              <th>Nom</th>
              <th>Prix ($)</th>
              <th>Variation ($)</th>
              <th>Variation (%)</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {etfs.map((etf) => (
              <tr key={etf.id}>
                <td>{etf.symbol}</td>
                <td>{etf.name}</td>
                <td>{Number(etf.price).toFixed(2)}</td>
                <td>{Number(etf.price_change).toFixed(2)}</td>
                <td>{Number(etf.change_percent).toFixed(2)}</td>
                <td>{Number(etf.volume).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default EtfTable;
