from mesa import Agent
from queue import PriorityQueue

class Car(Agent):
    def __init__(self, unique_id, model, destination):

        super().__init__(unique_id, model)

        self.destination = destination
        self.destination_neighbors = []
        self.path = []
        self.arrived = 0
        self.current = 0

    def get_distance(self, pos1, pos2):
        """
        Manhattan
        """
        dx = abs(pos2[0] - pos1[0])
        dy = abs(pos2[1] - pos1[1])
        return dx + dy

    def get_route(self):
        """
        A*
        """
        self.path.clear() 

        destination_neighborhood = self.model.grid.get_neighborhood(self.destination, moore=True, include_center=False)

        for neighbor_cells in destination_neighborhood:
            if not isinstance(neighbor_cells, tuple):
                continue

            cell_agents = self.model.grid.get_cell_list_contents(neighbor_cells)
            for agent in cell_agents:
                if isinstance(agent, Road):
                    self.destination_neighbors.append(neighbor_cells)

        if self.pos in self.destination_neighbors:
            return


        open_list = PriorityQueue()
        open_list.put((0, self.pos))
        closed_list = set()

        path_trace = {}

        cost = {self.pos: 0}
        

        while not  open_list.empty():
            _, current_pos = open_list.get()

            if current_pos in self.destination_neighbors:
                self.path = self.temp_path(path_trace, current_pos)
                return

            closed_list.add(current_pos)

            for neighbor in self.model.graphNodes(current_pos):
                if neighbor.pos in closed_list:
                    continue

                new_cost = cost[current_pos] + 1

                if neighbor.pos not in cost or new_cost < cost[neighbor.pos]:

                    path_trace[neighbor.pos] = current_pos
                    cost[neighbor.pos] = new_cost
                    Totalcost = new_cost + self.get_distance(neighbor.pos, self.destination)
                    open_list.put((Totalcost, neighbor.pos))


    def temp_path(self, path_trace, current_pos):
        """
        temporary path
        """
        temp_path = []
        while current_pos in path_trace:
            temp_path.insert(0, current_pos)
            current_pos = path_trace[current_pos]
        return temp_path

    def move(self):
        """ 
        Determines if the agent can move in the direction that was chosen
        """    
        if not self.path:
            return

        next_pos = self.path[0]
        cell_agents = self.model.grid.get_cell_list_contents(next_pos)

        for agent in cell_agents:
            if isinstance(agent, Traffic_Light) and not agent.state:
                return 
            
        for agent in cell_agents:
            if isinstance(agent, Car):
                return 

        next_step = self.path.pop(0)
        self.model.grid.move_agent(self, next_step)

    def step(self):
        """
        Determines the new direction it will take, and then moves
        """

        if not self.path:
            self.get_route()

        if self.pos in self.destination_neighbors:
            self.arrived += 1
            self.current -= 1
            self.model.grid.remove_agent(self)
            self.model.schedule.remove(self)
        else:
            self.move()


class Traffic_Light(Agent):
    """
    Traffic light. Where the traffic lights are in the grid.
    """

    def __init__(self, unique_id, model, state=False, direction="Left", timeToChange=10):
        super().__init__(unique_id, model)
        self.direction = direction
        self.state = state
        self.timeToChange = timeToChange

    def step(self):
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

    def __init__(self, unique_id, model, direction="Left"):
        super().__init__(unique_id, model)
        self.direction = direction

    def step(self):
        pass