import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import QuestionnairePage from "./pages/QuestionnairePage";
import DashboardPage from "./pages/DashboardPage";
import AboutEtfPage from "./pages/AboutEtfPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/guide-etf" element={<AboutEtfPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
