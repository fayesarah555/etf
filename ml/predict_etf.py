import argparse
import json
from pathlib import Path

import pandas as pd
import yfinance as yf
from ta.momentum import RSIIndicator
from ta.trend import MACD
import joblib


BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "etf_predictor.pkl"
DEFAULT_TICKERS = [
    "AGG", "AMDL", "BIL", "BITO", "BITX", "BND", "CONY", "DIA", "DUST", "EEM",
    "EFA", "ETHA", "ETHD", "EWY", "EWZ", "FNGD", "FXI", "GBTC", "GDX", "GLD",
    "GLDM", "HYG", "IAU", "IBIT", "IEF", "IEFA", "IEMG", "IJH", "IONZ", "IWM",
    "IYR", "JDST", "JEPQ", "KRE", "KWEB", "LQD", "MSTU", "MSTY", "MSTZ", "NVD",
    "NVDL", "NVDX", "NVDY", "NVOX", "PLTD", "PLTZ", "QBTZ", "QID", "QQQ",
    "QYLD", "RGTZ", "RSP", "RWM", "SCHB", "SCHD", "SCHF", "SCHG", "SCHH",
    "SCHX", "SDS", "SGOL", "SGOV", "SH", "SLV", "SMCZ", "SOLT", "SOXL", "SOXS",
    "SPDN", "SPLG", "SPXU", "SPY", "SQQQ", "SRTY", "TLT", "TNA", "TQQQ",
    "TSDD", "TSLL", "TSLQ", "TSLS", "TSLY", "TZA", "ULTY", "UNG", "UVIX",
    "UVXY", "VCIT", "VEA", "VWO", "XLB", "XLE", "XLF", "XLI", "XLK", "XLP",
    "XLRE", "XLU", "XLV", "XRT",
]


def load_model():
    return joblib.load(MODEL_PATH)


def compute_indicators(series: pd.Series) -> pd.DataFrame:
    indicators = pd.DataFrame(index=series.index)
    indicators["RSI"] = RSIIndicator(series, window=14).rsi()
    macd = MACD(series)
    indicators["MACD"] = macd.macd()
    indicators["MA20"] = series.rolling(20).mean()
    indicators["MA50"] = series.rolling(50).mean()
    indicators["Volatility"] = series.pct_change().rolling(20).std()
    return indicators


def build_feature_row(ticker: str, price_data: pd.DataFrame, feature_names):
    if price_data.empty:
        return None

    price_data = price_data.copy()
    close_series = price_data["Close"]
    if isinstance(close_series, pd.DataFrame):
        close_series = close_series.squeeze("columns")
    close_series = close_series.astype(float)

    indicators = compute_indicators(close_series)
    price_data = price_data.join(indicators)
    price_data = price_data.dropna()
    if price_data.empty:
        return None

    latest = price_data.iloc[-1]

    features = {name: 0.0 for name in feature_names}

    mapping = {
        "RSI ": "RSI",
        "MACD ": "MACD",
        "MA20 ": "MA20",
        "MA50 ": "MA50",
        "Volatility ": "Volatility",
    }

    for model_col, df_col in mapping.items():
        if model_col in features:
            features[model_col] = float(latest[df_col])

    volume_series = price_data["Volume"]
    if isinstance(volume_series, pd.DataFrame):
        volume_series = volume_series.squeeze("columns")

    volume_col = f"Volume {ticker}"
    if volume_col in features:
        features[volume_col] = float(volume_series.iloc[-1])

    return features


def predict_for_tickers(tickers):
    model = load_model()
    feature_names = model.get_booster().feature_names
    results = []

    for ticker in tickers:
        try:
            raw_data = yf.download(
                ticker,
                period="6mo",
                interval="1d",
                progress=False,
                auto_adjust=False,
            )
        except Exception as error:
            results.append(
                {
                    "symbol": ticker,
                    "error": f"Erreur lors du téléchargement des données : {error}",
                }
            )
            continue

        if isinstance(raw_data.columns, pd.MultiIndex):
            raw_data.columns = raw_data.columns.droplevel(-1)

        feature_row = build_feature_row(ticker, raw_data, feature_names)
        if not feature_row:
            results.append(
                {
                    "symbol": ticker,
                    "error": "Données insuffisantes pour calculer les indicateurs",
                }
            )
            continue

        df_input = pd.DataFrame([feature_row])[feature_names]
        proba = float(model.predict_proba(df_input)[0][1])
        results.append(
            {
                "symbol": ticker,
                "probability": proba,
            }
        )

    return results


def main():
    parser = argparse.ArgumentParser(description="ETF prediction helper")
    parser.add_argument(
        "--symbols",
        nargs="*",
        default=None,
        help="Symbols to score",
    )
    args = parser.parse_args()

    tickers = args.symbols if args.symbols else DEFAULT_TICKERS
    predictions = predict_for_tickers(tickers)
    print(json.dumps(predictions))


if __name__ == "__main__":
    main()
