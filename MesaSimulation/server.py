from agent import Car, Destination, Obstacle, Road, Traffic_Light
from model import CityModel
from mesa.visualization import CanvasGrid
from mesa.visualization.ModularVisualization import ModularServer


def agent_portrayal(agent):
    if agent is None:
        return
    
    portrayal = {
        "Shape": "rect",
        "Filled": "true",
        "Layer": 1,
        "w": 1,
        "h": 1
    }

    if isinstance(agent, Road):
        portrayal["Color"] = "grey"
        portrayal["Layer"] = 0

    elif isinstance(agent, Destination):
        portrayal["Color"] = "lightgreen"
        portrayal["Layer"] = 0

    elif isinstance(agent, Traffic_Light):
        portrayal["Color"] = "red" if not agent.state else "green"
        portrayal["Layer"] = 0
        portrayal["w"] = 0.8
        portrayal["h"] = 0.8

    elif isinstance(agent, Obstacle):
        portrayal["Color"] = "cadetblue"
        portrayal["Layer"] = 0
        portrayal["w"] = 0.8
        portrayal["h"] = 0.8

    elif isinstance(agent, Car):
        portrayal["Color"] = "blue"
        portrayal["Layer"] = 2
        portrayal["w"] = 0.5
        portrayal["h"] = 0.5

    return portrayal


width = 0
height = 0

with open('city_files/2024_base.txt') as baseFile:
    lines = baseFile.readlines()
    width = len(lines[0]) - 1
    height = len(lines)


grid = CanvasGrid(agent_portrayal, width, height, 500, 500)

model_params = {}

server = ModularServer(CityModel, [grid], "City Simulation", model_params)

server.port = 8521 
server.launch()
