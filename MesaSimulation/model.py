from mesa import Model
from mesa.time import RandomActivation
from mesa.space import MultiGrid
from agent import Car, Destination, Obstacle, Road, Traffic_Light
import json


class CityModel(Model):
    """
    Creates a model based on a city map.
    """
    def __init__(self):
        super().__init__()

        self.traffic_lights = []
        self.graph = []

        dataDictionary = json.load(open("city_files/mapDictionary.json"))
        lines = open("city_files/2024_base.txt").readlines()

        self.width = len(lines[0]) - 1
        self.height = len(lines)

        self.grid = MultiGrid(self.width, self.height, torus=False)
        self.schedule = RandomActivation(self)

        for r, row in enumerate(lines):
            for c, col in enumerate(row):
                pos = (c, self.height - r - 1)
                self.process_cell(r, c, col, pos, dataDictionary, lines)

        self.CreateCars()
        self.running = True
        self.Creategraph()

    def process_cell(self, r, c, col, pos, dataDictionary, lines):
        if col in ["v", "^", ">", "<"]:
            agent = Road(f"r_{r*self.width+c}", self, dataDictionary[col])
            self.grid.place_agent(agent, pos)

        elif col in ["S", "s"]:
            self.create_traffic_light(r, c, col, pos, dataDictionary, lines)

        elif col == "#":
            agent = Obstacle(f"ob_{r*self.width+c}", self)
            self.grid.place_agent(agent, pos)

        elif col == "D":
            obstacle = Obstacle(f"ob_{r*self.width+c}", self)
            self.grid.place_agent(obstacle, pos)
            destination = Destination(f"d_{r*self.width+c}", self)
            self.grid.place_agent(destination, pos)

    def create_traffic_light(self, r, c, col, pos, dataDictionary, lines):
        road_created = False
        neighbors = (
            [lines[r - 1][c], lines[r + 1][c]] if col == "S" else [lines[r][c - 1], lines[r][c + 1]]
        )

        for road in neighbors:
            if road in ["v", "^", ">", "<"]:
                road_agent = Road(f"r_{r*self.width+c}", self, dataDictionary[road])
                self.grid.place_agent(road_agent, pos)
                road_created = True
                break

        if not road_created:
            default_direction = "v" if col == "S" else ">"
            road_agent = Road(f"r_{r*self.width+c}", self, dataDictionary[default_direction])
            self.grid.place_agent(road_agent, pos)

        traffic_light = Traffic_Light(
            f"tl_{r*self.width+c}",
            self,
            direction=road_agent.direction,
            state=(col == "s"),
            timeToChange=int(dataDictionary[col]),
        )
        self.grid.place_agent(traffic_light, pos)
        self.schedule.add(traffic_light)
        self.traffic_lights.append(traffic_light)

    def graphNodes(self, road):
        return next((node[1] for node in self.graph if road == node[0]), None)

    def step(self):
        if self.schedule.steps % 10 == 0:
            self.CreateCars()

        self.schedule.step()

    def CreateCars(self):
        spawnPoint = [(0, 0), (0, self.height - 1), (self.width - 1, 0), (self.width - 1, self.height - 1)]

        for spawn in spawnPoint:
            if any(isinstance(agent, Car) for agent in self.grid.iter_cell_list_contents([spawn])):
                break

            destination_pos = []
            for destination in self.get_agents_of_type(Destination):
                destination_pos.append(destination.pos)

            new_car = Car(self.next_id(), self, self.random.choice(destination_pos))
            self.grid.place_agent(new_car, spawn)
            self.schedule.add(new_car)

    def Roads(self, road):
        NeighborRoads = []
        for neighbor in self.grid.get_neighbors(road.pos, moore=True, include_center=False):
            if isinstance(neighbor, Road):
                NeighborRoads.append(neighbor)

        Roads = []
        for neighbor_road in NeighborRoads:
            if self.Conect_RoadNodes(road, neighbor_road):
                Roads.append(neighbor_road)
        return Roads


    def Conect_RoadNodes(self, road, neighbor_road):
        direction_checks = {
            "Up": lambda: neighbor_road.pos[1] == road.pos[1] + 1 and not (
                (neighbor_road.direction == "Left" and neighbor_road.pos[0] > road.pos[0]) or
                (neighbor_road.direction == "Right" and neighbor_road.pos[0] < road.pos[0])
            ),
            "Down": lambda: neighbor_road.pos[1] == road.pos[1] - 1 and not (
                (neighbor_road.direction == "Left" and neighbor_road.pos[0] > road.pos[0]) or
                (neighbor_road.direction == "Right" and neighbor_road.pos[0] < road.pos[0])
            ),
            "Left": lambda: neighbor_road.pos[0] == road.pos[0] - 1 and not (
                (neighbor_road.direction == "Up" and neighbor_road.pos[1] < road.pos[1]) or
                (neighbor_road.direction == "Down" and neighbor_road.pos[1] > road.pos[1])
            ),
            "Right": lambda: neighbor_road.pos[0] == road.pos[0] + 1 and not (
                (neighbor_road.direction == "Up" and neighbor_road.pos[1] < road.pos[1]) or
                (neighbor_road.direction == "Down" and neighbor_road.pos[1] > road.pos[1])
            ),
        }

        return direction_checks.get(road.direction, lambda: False)()


    def Creategraph(self):
        self.graph = list(map(lambda road: (road.pos, self.Roads(road)), self.get_agents_of_type(Road)))
   
