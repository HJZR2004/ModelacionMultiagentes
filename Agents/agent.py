from mesa import Agent
import heapq

def a_star(grid, start, goal): 
    open_set = []
    heapq.heappush(open_set, (0, start))

    came_from = {}  
    g_score = {start: 0}  
    f_score = {start: manhattan_distance(start, goal)}  

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path

        for neighbor in get_neighbors(grid, current):
            tentative_g_score = g_score[current] + 1  
            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = tentative_g_score + manhattan_distance(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))
                came_from[neighbor] = current

    return []


def get_neighbors(grid, position):

    neighbors = grid.get_neighborhood(position, moore=False, include_center=False)
    valid_neighbors = []

    for neighbor in neighbors:
        agents = grid.get_cell_list_contents([neighbor])
        for agent in agents:
            if isinstance(agent, Road):
                valid_neighbors.append(neighbor)
            elif isinstance(agent, Traffic_Light):
                if agent.state:
                    valid_neighbors.append(neighbor)
    return valid_neighbors

def contains_road_or_destination(grid, position):
    agents = grid.get_cell_list_contents([position])
    return any(isinstance(agent, (Road, Destination)) for agent in agents)

def manhattan_distance(pos1, pos2):
    return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])


class Car(Agent):
    """
    Agent that moves randomly.
    Attributes:
        unique_id: Agent's ID 
        direction: Randomly chosen direction chosen from one of eight directions
    """
    def __init__(self, unique_id, model, position, destination, roads):
        """
        Creates a new random agent.
        Args:
            unique_id: The agent's ID
            model: Model reference for the agent
        """
        super().__init__(unique_id, model)
        self.pos = position
        self.destination = destination
        self.roads = roads
        self.path = []
        self.Nstep = 0

    def move(self):
        """  
        Determines if the agent can move in the direction that was chosen
        """
        if self.path:
            next_position = self.path.pop(0)
            self.model.grid.move_agent(self, next_position)

    def step(self):
        """ 
        Determines the new direction it will take, and then moves
        """
        if self.pos == self.destination:
            return
        
        if not self.path:
            self.path = a_star(self.model.grid, self.pos, self.destination)

        if self.path:
            self.move()

class Traffic_Light(Agent):
    """
    Traffic light. Where the traffic lights are in the grid.
    """
    def __init__(self, unique_id, model, state = False, timeToChange = 10):
        super().__init__(unique_id, model)
        """
        Creates a new Traffic light.
        Args:
            unique_id: The agent's ID
            model: Model reference for the agent
            state: Whether the traffic light is green or red
            timeToChange: After how many step should the traffic light change color 
        """
        self.state = state
        self.timeToChange = timeToChange

    def step(self):
        """ 
        To change the state (green or red) of the traffic light in case you consider the time to change of each traffic light.
        """
        if self.model.schedule.steps % self.timeToChange == 0:
            self.state = not self.state

class Destination(Agent):
    """
    Destination agent. Where each car should go.
    """
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)

    def step(self):
        pass

class Obstacle(Agent):
    """
    Obstacle agent. Just to add obstacles to the grid.
    """
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)

    def step(self):
        pass

class Road(Agent):
    """
    Road agent. Determines where the cars can move, and in which direction.
    """
    def __init__(self, unique_id, model, direction= "Left"):
        """
        Creates a new road.
        Args:
            unique_id: The agent's ID
            model: Model reference for the agent
            direction: Direction where the cars can move
        """
        super().__init__(unique_id, model)
        self.direction = direction

    def step(self):
        pass
