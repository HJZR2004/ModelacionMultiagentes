# api.py
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from model import CityModel
from carAgent import Car, Traffic_Light, Destination, Obstacle, Road

# Global variables
number_agents = 10
width = 28
height = 28
cityModel = None
currentStep = 0

app = Flask("Traffic example")
cors = CORS(app, origins=['http://localhost'])

@app.route('/init', methods=['POST'])
@cross_origin()
def initModel():
    global currentStep, cityModel, number_agents, width, height

    if request.method == 'POST':
        try:
            number_agents = int(request.json.get('NAgents'))
            width = int(request.json.get('width'))
            height = int(request.json.get('height'))
            currentStep = 0

            cityModel = CityModel(number_agents, width, height)
            return jsonify({"message": "Model initialized successfully."})
        except Exception as e:
            return jsonify({"message": f"Error initializing model: {e}"}), 500

@app.route('/getAgents', methods=['GET'])
@cross_origin()
def getAgents():
    global cityModel
    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400
    try:
        carPosition = [
            {"id": str(agent.unique_id), "x": x, "y": 0.5, "z": z}
            for agents, (x, z) in cityModel.grid.coord_iter()
            for agent in agents if isinstance(agent, Car)
        ]
        return jsonify({'positions': carPosition})
    except Exception as e:
        return jsonify({"message": f"Error retrieving agent positions: {e}"}), 500

@app.route('/getObstacles', methods=['GET'])
@cross_origin()
def getObstacles():
    global cityModel
    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400
    try:
        obstaclePosition = [
            {"id": str(agent.unique_id), "x": x, "y": 1.5, "z": z}
            for agents, (x, z) in cityModel.grid.coord_iter()
            for agent in agents if isinstance(agent, Obstacle)
        ]
        return jsonify({'positions': obstaclePosition})
    except Exception as e:
        return jsonify({"message": f"Error retrieving obstacle positions: {e}"}), 500


@app.route('/update', methods=['GET'])
@cross_origin()
def updateModel():
    global currentStep, cityModel
    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400
    try:
        cityModel.step()
        currentStep += 1
        return jsonify({'message': f'Model updated to step {currentStep}.', 'currentStep': currentStep})
    except Exception as e:
        return jsonify({"message": f"Error updating model: {e}"}), 500


@app.route('/getTrafficLights', methods=['GET'])
@cross_origin()
def getTrafficLights():
    global cityModel
    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400
    try:
        trafficLightPosition = [
            {"id": str(agent.unique_id), "x": x, "y": 2, "z": z, "condition": agent.state}
            for agents, (x, z) in cityModel.grid.coord_iter()
            for agent in agents if isinstance(agent, Traffic_Light)
        ]
        return jsonify({'positions': trafficLightPosition})
    except Exception as e:
        return jsonify({"message": f"Error retrieving traffic light positions: {e}"}), 500


@app.route('/getRoads', methods=['GET'])
@cross_origin()
def getRoads():
    global cityModel
    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400
    try:
        roadPosition = [
            {"id": str(agent.unique_id), "x": x, "y": 0.5, "z": z}
            for agents, (x, z) in cityModel.grid.coord_iter()
            for agent in agents if isinstance(agent, Road)
        ]
        return jsonify({'positions': roadPosition})
    except Exception as e:
        return jsonify({"message": f"Error retrieving road positions: {e}"}), 500


@app.route('/getDestination', methods=['GET'])
@cross_origin()
def getDestination():
    global cityModel
    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400
    try:
        destinationPosition = [
            {"id": str(agent.unique_id), "x": x, "y": 0.5, "z": z}
            for agents, (x, z) in cityModel.grid.coord_iter()
            for agent in agents if isinstance(agent, Destination)
        ]
        return jsonify({'positions': destinationPosition})
    except Exception as e:
        return jsonify({"message": f"Error retrieving destination positions: {e}"}), 500


if __name__ == '__main__':
    app.run(host="localhost", port=8585, debug=True)
