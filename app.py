# app.py
import os
import json

from sanic import Sanic, response
from sanic.exceptions import SanicException

from sanic_cors import CORS

from ml_tools.dota2_win_prediction.model import predict_radiant_win

app = Sanic(__name__)
app.static("/static/img/ml_tools", "./ml_tools")
CORS(app)

ML_TOOLS_FOLDER = 'ml_tools'  # Specify the folder containing ML tools


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

    from time import sleep
    sleep(5)

    return response.json(team1_win_probability)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
