"""
Julian Ramirez A01027743
Fernando Fuentes A01028796

Este archivo nos ayuda a comunicar nuestra simulacion de mesa con WebGL
"""

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from model import CityModel
from carAgent import Car, Traffic_Light, Destination, Obstacle, Road

# Size of the board:
number_agents = 10
width = 28
height = 28
cityModel = None
currentStep = 0

# This application will be used to interact with WebGL
app = Flask("Traffic example")
cors = CORS(app, origins=['http://localhost'])

@app.route('/init', methods=['POST'])
@cross_origin()
def initModel():
    global cityModel, currentStep

    if request.method == 'POST':
        try:
            # Inicializar el modelo con los archivos predefinidos
            print("Initializing CityModel...")
            cityModel = CityModel()  # Constructor sin parámetros
            currentStep = 0
            print("CityModel initialized successfully.")

            # Responder con un mensaje de éxito
            return jsonify({"message": "Model initialized successfully."})

        except FileNotFoundError as e:
            print(f"File error: {e}")
            return jsonify({"message": f"File not found: {e}"}), 500

        except json.JSONDecodeError as e:
            print(f"JSON error: {e}")
            return jsonify({"message": "Error decoding JSON files."}), 500

        except Exception as e:
            print(f"Unexpected error: {e}")
            return jsonify({"message": "Error initializing the model."}), 500



@app.route('/getAgents', methods=['GET'])
@cross_origin()
def getAgents():
    global cityModel

    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400

    try:
        print("Fetching car positions...")
        
        car_positions = []
        for agent in cityModel.schedule.agents:
            if isinstance(agent, Car):
                # Verificar y registrar la posición del auto
                if hasattr(agent, "pos") and agent.pos:
                    print(f"Car {agent.unique_id} is at position {agent.pos}")
                    car_positions.append({
                        "id": str(agent.unique_id),
                        "x": agent.pos[0],
                        "y": 0.5,  # Altura fija
                        "z": agent.pos[1]
                    })
                else:
                    print(f"Car {agent.unique_id} has no position assigned.")

        print(f"Retrieved car positions: {car_positions}")
        return jsonify({'positions': car_positions})

    except Exception as e:
        print(f"Error fetching agents: {e}")
        return jsonify({"message": "Error with the agent positions"}), 500







@app.route('/getObstacles', methods=['GET'])
@cross_origin()
def getObstacles():
    global city

    if city is None:
        return jsonify({"message": "Model not initialized"}), 400

    if request.method == 'GET':
        try:
            # Get the positions of the obstacles and return them to WebGL in JSON.json.t.
            # Same as before, the positions are sent as a list of dictionaries, where each dictionary has the id and position of an obstacle.
            obstaclePosition = [
                {"id": str(agent.unique_id), "x": x, "y": 1.5, "z": z}
                for agents, (x, z) in city.grid.coord_iter()
                for agent in agents if isinstance(agent, Obstacle)
            ]

            return jsonify({'positions': obstaclePosition})
        except Exception as e:
            print(e)
            return jsonify({"message": "Error with obstacle positions"}), 500


@app.route('/getTrafficLights', methods=['GET'])
@cross_origin()
def getTrafficLights():
    global city

    if city is None:
        return jsonify({"message": "Model not initialized"}), 400

    if request.method == 'GET':
        try:
            # Get the positions of the obstacles and return them to WebGL in JSON.json.t.
            # Same as before, the positions are sent as a list of dictionaries, where each dictionary has the id and position of an obstacle.
            trafficLightPosition = [
                {"id": str(agent.unique_id), "x": x, "y": 2,
                 "z": z, "condition": agent.condition}
                for agents, (x, z) in city.grid.coord_iter()
                for agent in agents if isinstance(agent, Traffic_Light)
            ]

            return jsonify({'positions': trafficLightPosition})
        except Exception as e:
            print(e)
            return jsonify({"message": "Error with obstacle positions"}), 500


@app.route('/getRoads', methods=['GET'])
@cross_origin()
def getRoads():
    global city

    if city is None:
        return jsonify({"message": "Model not initialized"}), 400

    if request.method == 'GET':
        try:
            # Get the positions of the obstacles and return them to WebGL in JSON.json.t.
            # Same as before, the positions are sent as a list of dictionaries, where each dictionary has the id and position of an obstacle.
            roadPosition = [
                {"id": str(agent.unique_id), "x": x, "y": 0.5, "z": z}
                for agents, (x, z) in city.grid.coord_iter()
                for agent in agents if isinstance(agent, Road)
            ]

            return jsonify({'positions': roadPosition})
        except Exception as e:
            print(e)
            return jsonify({"message": "Error with obstacle positions"}), 500


@app.route('/getDestination', methods=['GET'])
@cross_origin()
def getDestination():
    global city

    if city is None:
        return jsonify({"message": "Model not initialized"}), 400

    if request.method == 'GET':
        try:
            # Get the positions of the obstacles and return them to WebGL in JSON.json.t.
            # Same as before, the positions are sent as a list of dictionaries, where each dictionary has the id and position of an obstacle.
            destinationPosition = [
                {"id": str(agent.unique_id), "x": x, "y": 0.5, "z": z}
                for agents, (x, z) in city.grid.coord_iter()
                for agent in agents if isinstance(agent, Destination)
            ]

            return jsonify({'positions': destinationPosition})
        except Exception as e:
            print(e)
            return jsonify({"message": "Error with obstacle positions"}), 500

# This route will be used to update the model


@app.route('/update', methods=['GET'])
@cross_origin()
def updateModel():
    global currentStep, city
    if request.method == 'GET':
        try:
            # Update the model and return a message to WebGL saying that the model was updated successfully
            city.step()
            currentStep += 1
            return jsonify({'message': f'Model updated to step {currentStep}.', 'currentStep': currentStep})
        except Exception as e:
            print(e)
            return jsonify({"message": "Error during step."}), 500


if __name__ == '__main__':
    # Run the flask server in port 8585
    app.run(host="localhost", port=8585, debug=True)
