import pytest
from unittest.mock import MagicMock, mock_open
from app import app, fetch_stock_data, get_stock_prices_prediction


@pytest.mark.asyncio
async def test_fetch_stock_data():
    symbol = "AAPL"
    with patch("yfinance.download") as mock_yf:
        mock_yf.return_value = MagicMock(
            iterrows=lambda: iter(
                [
                    (
                        datetime(2024, 1, 1),
                        {
                            "Open": 100,
                            "High": 110,
                            "Low": 90,
                            "Close": 105,
                            "Volume": 10000,
                        },
                    )
                ]
            )
        )
        data = await fetch_stock_data(symbol)
    assert isinstance(data, list)
    assert "datetime" in data[0]
    assert "close" in data[0]
    assert data[0]["close"] == 105


from datetime import datetime
import pandas as pd
from unittest.mock import patch
import pytest


@pytest.mark.asyncio
async def test_get_stock_prices_prediction():
    stock_data = [
        {"datetime": "2024-01-01 00:00:00", "close": 105},
        {"datetime": "2024-01-02 00:00:00", "close": 107},
    ]
    period = 7
    fixed_now = datetime(2024, 1, 3)  # Mock today's date to align with test data

    # Mock future dataframe for Prophet
    future_dates = pd.date_range(start="2024-01-03", periods=7, freq="D")
    mock_future_df = pd.DataFrame({"ds": future_dates})
    mock_forecast_df = pd.DataFrame({"ds": future_dates, "yhat": [110] * 7})

    with patch("prophet.Prophet.fit") as mock_fit, patch(
        "prophet.Prophet.make_future_dataframe", return_value=mock_future_df
    ), patch("prophet.Prophet.predict", return_value=mock_forecast_df), patch(
        "app.datetime", wraps=datetime
    ) as mock_datetime:  # Mock datetime

        mock_datetime.now.return_value = (
            fixed_now  # Force `datetime.now()` to return 2024-01-03
        )
        forecast = await get_stock_prices_prediction(stock_data, period)

    print("Forecast Output:", forecast)  # Debugging output

    assert isinstance(forecast, dict)
    assert "2024-01-08 00:00:00" in forecast  # Ensure expected date exists
    assert forecast["2024-01-08 00:00:00"]["yhat"] == 110


def test_stock_price_prediction(test_client):
    symbol = "AAPL"
    period = 14
    file_path = f"./ml_tools/stocks_price_prediction/data/{symbol}.csv"

    # Mock file contents (simulate CSV file data)
    mock_csv_data = (
        "datetime,open,high,low,close,volume\n"
        "2024-01-01 00:00:00,100,110,90,105,10000\n"
    )

    with patch("os.path.exists", return_value=True), patch(
        "os.path.getmtime", return_value=10_000_000_000.0
    ), patch("builtins.open", mock_open(read_data=mock_csv_data)), patch(
        "app.fetch_stock_data",
        return_value=[{"datetime": "2024-01-01 00:00:00", "close": 105}],
    ), patch(
        "app.get_stock_prices_prediction",
        return_value={"2024-01-08 00:00:00": {"yhat": 110}},
    ):
        request, response = app.test_client.get(
            f"/api/ml-tools/stocks-price-prediction?symbol={symbol}&period={period}"
        )

    assert response.status == 200
    assert response.json == [{"yhat": 110}]


def test_dota2_win_prediction(test_client):
    team1 = "1,2,3,4,5"
    team2 = "6,7,8,9,10"

    with patch("app.predict_radiant_win", return_value=0.75):
        request, response = app.test_client.get(
            f"/api/ml-tools/dota2-win-prediction?team1={team1}&team2={team2}",
        )

    assert response.status == 200
    assert float(response.text) == 0.75


def test_dota2_win_prediction_invalid_teams(test_client):
    team1 = "1,2,3,4"
    team2 = "6,7,8,9,10"
    request, response = app.test_client.get(
        f"/api/ml-tools/dota2-win-prediction?team1={team1}&team2={team2}"
    )
    assert response.status == 403
