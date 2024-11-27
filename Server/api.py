"""
Julian Ramirez A01027743
Fernando Fuentes A01028796

Este archivo nos ayuda a comunicar nuestra simulacion de mesa con WebGL
"""

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from MesaSimulation.model import CityModel
from MesaSimulation.carAgent import Car, Traffic_Light, Destination, Obstacle, Road

# Size of the board:
number_agents = 10
width = 28
height = 28
cityModel = None
currentStep = 0

# This application will be used to interact with WebGL
app = Flask("Traffic example")
cors = CORS(app, origins=['http://localhost'])

# This route will be used to send the parameters of the simulation to the server.
# The servers expects a POST request with the parameters in a.json.
@app.route('/init', methods=['POST', 'GET'])
@cross_origin()
def initModel():
    global currentStep, cityModel, number_agents, width, height

    if request.method == 'POST' or request.method == 'GET':
        try:
            if request.method == 'POST':
                number_agents = int(request.json.get('NAgents'))
                width = int(request.json.get('width'))
                height = int(request.json.get('height'))
            else:
                number_agents = 10
                width = 28
                height = 28

            currentStep = 0

            print(f"Request JSON: {request.json}")
            print(f"Model parameters: {number_agents}, width: {width}, height: {height}")

            # Create the model using the parameters sent by the application
            cityModel = CityModel(number_agents)
            print("Model initialized successfully")

            # Return a message to saying that the model was created successfully
            return jsonify({"message":"Parameters received, model initiated."})

        except Exception as e:
            print(f"Error initializing the model: {e}")
            return jsonify({"message": f"Error initializing the model: {e}"}), 500
        

#This route will be used to get the positions of the obstacles.
@app.route('/getObstacles',methods=['GET'])
@cross_origin()
def getObstacles():
    global cityModel
    if request.method == 'GET':
        try:
            if cityModel is None:
                raise Exception("Model not initialized")

            # Get the obstacles from the model
            obstaclePositions = [
                {"id": str(a.unique_id), "x": x, "y": 1, "z": z}
                for a, (x, z) in cityModel.grid.coord_iter() if isinstance(a, Obstacle)
            ]

            return jsonify({'positions': obstaclePositions})
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"message": f"Error with obstacle positions: {e}"}), 500


if __name__=='__main__':
    # Run the flask server in port 8585
    app.run(host="localhost", port=8585, debug=True)