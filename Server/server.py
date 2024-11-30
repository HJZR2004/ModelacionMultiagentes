"""
Julian Ramirez A01027743
Fernando Fuentes A01028796

Este archivo nos ayuda a comunicar nuestra simulacion de mesa con WebGL
"""

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from model import CityModel
from agent import Car, Traffic_Light, Destination, Obstacle, Road

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
            print("Initializing CityModel...")
            # Initialize the CityModel
            cityModel = CityModel()
            currentStep = 0
            print("CityModel initialized successfully.")

            # Verifying agents in the schedule
            print("Agents in schedule:")
            schedule_agents = []
            for agent in cityModel.schedule.agents:
                agent_info = {
                    "Agent ID": agent.unique_id,
                    "Type": type(agent).__name__,
                    "Position": getattr(agent, "pos", "No position")
                }
                schedule_agents.append(agent_info)
                print(agent_info)

            # Verifying agents in the grid
            print("Agents in grid:")
            grid_agents = []
            for cell in cityModel.grid.coord_iter():
                cell_agents, (x, z) = cell
                for agent in cell_agents:
                    agent_info = {
                        "Agent ID": agent.unique_id,
                        "Type": type(agent).__name__,
                        "Position": (x, z)
                    }
                    grid_agents.append(agent_info)
                    print(agent_info)

            return jsonify({
                "message": "Model initialized successfully.",
                "schedule_agents": schedule_agents,
                "grid_agents": grid_agents
            })

        except Exception as e:
            print(f"Unexpected error during initialization: {e}")
            return jsonify({"message": f"Error initializing the model: {str(e)}"}), 500




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
    global cityModel

    if cityModel is None:
        print("cityModel is not initialized.")
        return jsonify({"message": "Model not initialized"}), 400

    if request.method == 'GET':
        try:
            print("Starting obstacle position fetch...")

            obstacle_positions = []
            for cell in cityModel.grid.coord_iter():
                cell_agents, (x, z) = cell  # `coord_iter()` devuelve (lista_agentes, (x, y))
                print(f"Cell ({x}, {z}) contains: {[type(agent).__name__ for agent in cell_agents]}")

                for agent in cell_agents:
                    if isinstance(agent, Obstacle):
                        print(f"Found obstacle {agent.unique_id} at ({x}, {z})")
                        obstacle_positions.append({
                            "id": str(agent.unique_id),
                            "x": x,
                            "y": 1.5,  # Altura fija para representación 3D
                            "z": z
                        })

            print(f"Returning obstacle positions: {obstacle_positions}")
            return jsonify({'positions': obstacle_positions})

        except Exception as e:
            print(f"Error fetching obstacle positions: {e}")
            return jsonify({"message": f"Error with obstacle positions: {str(e)}"}), 500



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
    global cityModel

    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400

    if request.method == 'GET':
        try:
            print("Fetching road positions...")

            road_positions = []
            for cell in cityModel.grid.coord_iter():
                cell_agents, (x, z) = cell
                for agent in cell_agents:
                    if isinstance(agent, Road):
                        print(f"Found road {agent.unique_id} at ({x}, {z})")
                        road_positions.append({
                            "id": str(agent.unique_id),
                            "x": x,
                            "y": 0.5,  # Altura fija para representación 3D
                            "z": z
                        })

            print(f"Returning road positions: {road_positions}")
            return jsonify({'positions': road_positions})

        except Exception as e:
            print(f"Error fetching road positions: {e}")
            return jsonify({"message": f"Error with road positions: {str(e)}"}), 500


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
def update_model():
    """
    Actualiza el estado del modelo CityModel avanzando un paso y devuelve el número de paso actual.
    """
    global currentStep, cityModel

    if request.method == 'GET':
        try:
            # Asegúrate de que el modelo está inicializado
            if cityModel is None:
                return jsonify({"message": "Model is not initialized. Please initialize the model first."}), 400

            # Avanza un paso en el modelo
            cityModel.step()
            currentStep += 1

            # Retorna un mensaje de éxito con el paso actual
            return jsonify({'message': f'Model updated to step {currentStep}.', 'currentStep': currentStep}), 200
        except Exception as e:
            # Manejo de errores durante la actualización
            print(f"Error during model update: {e}")
            return jsonify({"message": "Error during step.", "error": str(e)}), 500

        

@app.route('/step', methods=['GET'])
@cross_origin()
def step():
    global cityModel, currentStep

    if cityModel is None:
        return jsonify({"message": "Model not initialized"}), 400

    try:
        print(f"Executing step {currentStep}...")
        cityModel.step()
        currentStep += 1
        print(f"Step {currentStep} completed.")
        return jsonify({"message": f"Step {currentStep} completed."})

    except Exception as e:
        print(f"Error during step: {e}")
        return jsonify({"message": "Error during step execution"}), 500



if __name__ == '__main__':
    # Run the flask server in port 8585
    app.run(host="localhost", port=8585, debug=True)