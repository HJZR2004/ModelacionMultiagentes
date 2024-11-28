from mesa import Model
from mesa.time import RandomActivation
from mesa.space import MultiGrid
from agent import Car, Traffic_Light, Destination, Obstacle, Road
import json


class CityModel(Model):
    """ 
        Creates a model based on a city map.

        Args:
            N: Number of cars in the simulation
    """
    def __init__(self, initialCars,width,height):
        try:
            print("Loading mapDictionary.json...")
            dataDictionary = json.load(open("./city_files/mapDictionary.json"))
            print("mapDictionary.json loaded successfully.")
        except FileNotFoundError as e:
            print(f"Error: {e}")
            raise

        self.Nstep = 0
        self.traffic_lights = []
        self.destinations = []
        self.initialCars = initialCars
        self.obstacles = []  # Add a list to store obstacles

        try:
            print("Loading 2022_base.txt...")
            with open('./city_files/2022_base.txt') as baseFile:
                lines = baseFile.readlines()
                print("2022_base.txt loaded successfully.")
                self.width = len(lines[0])-1
                self.height = len(lines)
                print(f"Grid size: width={self.width}, height={self.height}")

                self.grid = MultiGrid(self.width, self.height, torus = False) 
                self.schedule = RandomActivation(self)

                self.car_spawn_positions = [
                    (0, 0), (self.width -1, 0), (0, self.height - 1), (self.width - 1, self.height -1)
                    ]

                for r, row in enumerate(lines):
                    for c, col in enumerate(row):
                        self.roads = []
                        if col in ["v", "^", ">", "<"]:
                            agent = Road(f"r_{r*self.width+c}", self, dataDictionary[col])
                            self.grid.place_agent(agent, (c, self.height - r - 1))
                            self.roads.append(((c, self.height - r - 1), dataDictionary[col]))
                            print(f"Placed Road at {(c, self.height - r - 1)} with direction {dataDictionary[col]}")

                        elif col in ["S", "s"]:
                            direction = self.get_direction_of_road((c, self.height - r - 1))
                            agent = Traffic_Light(f"tl_{r*self.width+c}", self, False if col == "S" else True, int(dataDictionary[col]))
                            self.grid.place_agent(agent, (c, self.height - r - 1))
                            self.schedule.add(agent)
                            self.traffic_lights.append(agent)
                            print(f"Placed Traffic Light at {(c, self.height - r - 1)} with state {'Red' if col == 'S' else 'Green'}")

                        elif col == "#":
                            agent = Obstacle(f"ob_{r*self.width+c}", self)
                            self.grid.place_agent(agent, (c, self.height - r - 1))
                            self.obstacles.append(agent)  # Add obstacle to the list
                            print(f"Placed Obstacle at {(c, self.height - r - 1)}")

                        elif col == "D":
                            agent = Destination(f"d_{r*self.width+c}", self)
                            self.grid.place_agent(agent, (c, self.height - r - 1))
                            print(f"Placed Destination at {(c, self.height - r - 1)}")
        except FileNotFoundError as e:
            print(f"Error: {e}")
            raise

        for i in range(self.initialCars):
            spawn_pos = self.car_spawn_positions[i % len(self.car_spawn_positions)]
            destination = self.destinations[0] if self.destinations else (self.width // 2, self.height // 2)
            car = Car(f"car_{i}", self, spawn_pos, destination, self.roads)
            self.grid.place_agent(car, spawn_pos)
            self.schedule.add(car)
            print(f"Placed Car {i} at {spawn_pos} with destination {destination}")

        self.running = True

    def step(self):
        '''Advance the model by one step.'''
        print(f"Step {self.Nstep}")
        self.schedule.step()
        self.Nstep += 1

        if self.Nstep % 10 == 0:
            for i, spawn_pos in enumerate(self.car_spawn_positions):
                destination = self.destinations[0] if self.destinations else (self.width // 2, self.height // 2)
                car = Car(f"car_{self.Nstep}_new_{i}", self, spawn_pos, destination, self.roads)
                self.grid.place_agent(car, spawn_pos)
                self.schedule.add(car)
                print(f"Placed new Car at step {self.Nstep} at {spawn_pos} with destination {destination}")

    def get_direction_of_road(self, position):
        agents_in_cell = self.grid.get_cell_list_contents([position])
        for agent in agents_in_cell:
            if isinstance(agent, Road):
                return agent.direction
        return None