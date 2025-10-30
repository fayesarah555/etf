import { Link, NavLink } from "react-router-dom";
import "../index.css";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <Link to="/">ETF Advisor</Link>
        </div>
        <nav className="menu">
          <NavLink to="/questionnaire">Questionnaire</NavLink>
          <NavLink to="/dashboard">Tableau de bord</NavLink>
          <NavLink to="/guide-etf">Comprendre les ETF</NavLink>
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <small>&copy; {new Date().getFullYear()} ETF Advisor</small>
      </footer>
    </div>
  );
}

export default Layout;
