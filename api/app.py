# app.py
import asyncio
import csv
import os
from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf
from prophet import Prophet
from sanic import Sanic, response
from sanic.exceptions import SanicException
from sanic_cors import CORS

from api.settings import SANIC_CONFIG
from ml_tools.dota2_win_prediction.model import predict_radiant_win

app = Sanic("ml_tools")
app.config.update(SANIC_CONFIG)
app.static("/static/img/ml_tools", "./ml_tools")
CORS(app)


# Async function to fetch stock data
async def fetch_stock_data(symbol: str) -> dict:
    loop = asyncio.get_event_loop()
    data = await loop.run_in_executor(None, lambda: yf.download(symbol, period="2y"))
    stock_data = [
        {
            "datetime": time.strftime('%Y-%m-%d %H:%M:%S'),
            "open": row['Open'],
            "high": row['High'],
            "low": row['Low'],
            "close": row['Close'],
            "volume": row['Volume']
        }
        for time, row in data.iterrows()
    ]
    return stock_data


async def get_stock_prices_prediction(stock_data: list, period: int) -> dict:
    df = pd.DataFrame(stock_data)
    df['ds'] = pd.to_datetime(df['datetime'])
    df['y'] = df['close'].astype(float)

    df_prophet = df[['ds', 'y']]
    loop = asyncio.get_event_loop()
    m = Prophet(
        changepoint_prior_scale=0.1,
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
    )
    m.add_country_holidays(country_name='US')
    await loop.run_in_executor(None, m.fit, df_prophet)
    future = await loop.run_in_executor(None, lambda: m.make_future_dataframe(periods=7))
    forecast = await loop.run_in_executor(None, m.predict, future)

    period_ago = pd.to_datetime(datetime.now() - timedelta(days=period + 1))
    forecast = forecast[forecast['ds'] > period_ago]

    forecast['ds'] = forecast['ds'].dt.strftime('%Y-%m-%d %H:%M:%S')
    forecast.rename(
        columns={'ds': 'datetime'},
        inplace=True
    )
    forecast = forecast[['datetime', 'yhat']].to_dict('records')
    forecast = {v['datetime']: v for v in forecast}
    return forecast


# Endpoint for fetching ML tools
@app.route('/api/ml-tools/dota2-win-prediction', methods=['GET'])
async def get_dota2_prediction(request):
    try:
        team1 = list(map(int, request.args.get("team1", "").split(",")))
        team2 = list(map(int, request.args.get("team2", "").split(",")))
    except ValueError as e:
        raise SanicException(e, 403)

    if len(team1) != 5 or len(team2) != 5:
        raise SanicException("5 heroes should be selected for radiant and dire!", 403)

    team1_win_probability = predict_radiant_win(team1, team2)

    return response.json(team1_win_probability)


@app.route('/api/ml-tools/stocks-price-prediction', methods=['GET'])
async def get_stock_prediction(request):
    symbol = request.args.get("symbol", "").upper()
    period = int(request.args.get("period", "14"))
    if not symbol:
        raise SanicException("Symbol is required!", status_code=400)

    file_path = f"./ml_tools/stocks_price_prediction/data/{symbol}.csv"
    need_update = False

    # Check if the file exists and is up to date
    if os.path.exists(file_path):
        last_modified_time = datetime.fromtimestamp(os.path.getmtime(file_path))
        if datetime.now() - last_modified_time > timedelta(hours=24):
            need_update = True
    else:
        need_update = True

    if need_update:
        stock_data = await fetch_stock_data(symbol)
        print(stock_data)
        with open(file_path, mode='w', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=["datetime", "open", "high", "low", "close", "volume"])
            writer.writeheader()
            writer.writerows(stock_data)
    else:
        with open(file_path, mode='r') as file:
            reader = csv.DictReader(file)
            stock_data = [row for row in reader]

    forecast = await get_stock_prices_prediction(stock_data, period)

    stock_data = {row["datetime"]: {"datetime": row["datetime"], "close": row["close"]} for row in stock_data if
                  row["datetime"] >= (datetime.now() - timedelta(days=period)).strftime('%Y-%m-%d')}

    combined_data = {k: {**stock_data.get(k, {}), **forecast.get(k, {})} for k in
                     sorted(list(set(stock_data) | set(forecast)))}

    return response.json(list(combined_data.values()))
