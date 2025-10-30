import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import ProfileSummary from "../components/ProfileSummary";
import RecommendationsList from "../components/RecommendationsList";
import EtfTable from "../components/EtfTable";

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialContext = useMemo(() => {
    if (location.state?.clientId) {
      return {
        id: location.state.clientId,
        profile: location.state.profile,
      };
    }
    const fromQuery = searchParams.get("clientId");
    if (fromQuery) {
      return { id: Number(fromQuery), profile: "equilibre" };
    }
    const stored = sessionStorage.getItem("clientContext");
    return stored ? JSON.parse(stored) : null;
  }, [location.state, searchParams]);

  const [client, setClient] = useState(null);
  const [profile, setProfile] = useState(initialContext?.profile || "");
  const [recommendations, setRecommendations] = useState(() => {
    const stored = sessionStorage.getItem("clientRecommendations");
    return stored ? JSON.parse(stored) : [];
  });
  const [etfs, setEtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictionMap, setPredictionMap] = useState({});
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  useEffect(() => {
    if (!initialContext?.id) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [clientRes, recoRes, etfsRes] = await Promise.all([
          apiClient.get(`/clients/${initialContext.id}`),
          apiClient.get(`/clients/${initialContext.id}/recommendations`),
          apiClient.get("/etfs"),
        ]);

        setClient(clientRes.data);
        setProfile(initialContext.profile);
        const recommendationData = recoRes.data;
        setRecommendations(recommendationData);
        setEtfs(etfsRes.data);

        const symbols = Array.from(
          new Set(
            recommendationData
              .map((item) => item.etf?.symbol)
              .filter(Boolean)
          )
        );
        if (symbols.length > 0) {
          await loadPredictions(symbols);
        } else {
          setPredictionMap({});
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [initialContext]);

  const loadPredictions = async (symbols) => {
    setPredictionLoading(true);
    setPredictionError(null);
    try {
      const { data } = await apiClient.get("/predictions", {
        params: { symbols: symbols.join(",") },
      });
      const map = {};
      data.forEach((item) => {
        if (typeof item.probability === "number") {
          map[item.symbol] = item.probability;
        }
      });
      setPredictionMap(map);
    } catch (error) {
      console.error(error);
      setPredictionError(
        "Impossible de récupérer les probabilités de hausse pour le moment."
      );
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!initialContext?.id) {
      return;
    }
    try {
      setRefreshing(true);
      const { data } = await apiClient.post(
        `/clients/${initialContext.id}/recommendations/refresh`
      );
      setRecommendations(data);
      sessionStorage.setItem(
        "clientRecommendations",
        JSON.stringify(data)
      );
      const symbols = Array.from(
        new Set(
          data
            .map((item) => item.etf?.symbol)
            .filter(Boolean)
        )
      );
      if (symbols.length > 0) {
        await loadPredictions(symbols);
      } else {
        setPredictionMap({});
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!initialContext?.id) {
    return (
      <section>
        <h2>Complétez le questionnaire</h2>
        <p>
          Nous avons besoin de votre profil pour afficher vos recommandations
          personnalisées.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/questionnaire")}
        >
          Accéder au questionnaire
        </button>
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        <p>Chargement de vos données...</p>
      </section>
    );
  }

  if (!client) {
    return (
      <section>
        <h2>Client introuvable</h2>
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/questionnaire")}
        >
          Recommencer
        </button>
      </section>
    );
  }

  return (
    <section className="dashboard-grid">
      <ProfileSummary
        name={client.name}
        email={client.email}
        profile={profile}
        riskLevel={client.risk_level}
        investmentHorizon={client.investment_horizon}
        experienceLevel={client.experience_level}
        sectorPreferences={client.sector_preferences}
      />
      <RecommendationsList
        recommendations={recommendations}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        predictions={predictionMap}
        predictionLoading={predictionLoading}
        predictionError={predictionError}
      />
      <EtfTable etfs={etfs} />
    </section>
  );
}

export default DashboardPage;
