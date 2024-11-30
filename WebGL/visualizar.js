'use strict';

import * as twgl from 'twgl.js';
import GUI from 'lil-gui';

//We import the obj files we will use
import buildingObj from './scripts/obj/building.obj?raw';
import roadObj from './scripts/obj/road.obj?raw'; 
import carObj from './scripts/obj/carcacha.obj?raw';
import destinationObj from './scripts/obj/destination.obj?raw';

//import vsGLSL from './shaders/vertex.glsl';
//import fsGLSL from './shaders/fragment.glsl';


//The script to make json files from obj files
import { loadObj } from './scripts/js/loadOBJ.js';

// Define the vertex shader code, using GLSL 3.00
const vsGLSL = `#version 300 es
in vec4 a_position;
in vec4 a_color;

uniform mat4 u_transforms;
uniform mat4 u_matrix;

out vec4 v_color;

void main() {
gl_Position = u_matrix * a_position;
v_color = a_color;
}
`;

// Define the fragment shader code, using GLSL 3.00
const fsGLSL = `#version 300 es
precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
outColor = v_color;
}
`;


// Define the agent server URI
const agent_server_uri = "http://localhost:8585/";

// Initialize arrays to store agents and obstacles
const agents_array = [];
const buildings_array = [];
const roads_array = [];
const destinations_array = [];

// Initialize WebGL-related variables
let gl, programInfo, buildingVao, buildingBufferInfo, roadVao, roadBufferInfo, carVao, carBuffer, destinationVao, destinationBuffer;

// Define the camera position
let cameraPosition = {x:-50, y:50, z:-50};

// Initialize the frame count
let frameCount = 0;

// Define the data object
const data = {
  NAgents: 500,
  width: 100,
  height: 100
};

//Define the building class
class Building {
  constructor(id, position=[0,0,0], rotation=[0,0,0],scale=[0.07,0.07,0.07]){
    this.id = id;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.color = [Math.random(), Math.random(), Math.random(), 1];
  }
}

//Define the road class
class Road {
  constructor(id, position=[0,0,0], rotation=[0,0,0],scale=[2,2,2]){
    this.id = id;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.color = [0,0,0, 1];
  }
}

//Define the car class
class Car {
  constructor(id, position=[0,0,0], rotation=[0,0,0],scale=[0.4,0.4,0.4]){
    this.id = id;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.color = [Math.random(), Math.random(), Math.random(), 1];
  }
}

//Define the destination class
class Destination {
  constructor(id, position=[0,0,0], rotation=[0,0,0],scale=[0.02,0.02,0.02]){
    this.id = id;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.color = [0,0,1, 1];
  }
}

// Main function to initialize and run the application
async function main() {
  const canvas = document.querySelector('canvas');
  gl = canvas.getContext('webgl2');

  // Crear el programa de shaders
  programInfo = twgl.createProgramInfo(gl, [vsGLSL, fsGLSL]);

  //Generar los modelos de los objetos
  const buildingModel = loadObj(buildingObj);
  const roadModel = loadObj(roadObj);
  const carModel = loadObj(carObj);
  const destinationModel = loadObj(destinationObj);


  // Generar los buffers necesarios
  buildingBufferInfo = twgl.createBufferInfoFromArrays(gl, buildingModel);
  roadBufferInfo = twgl.createBufferInfoFromArrays(gl, roadModel);
  carBuffer = twgl.createBufferInfoFromArrays(gl, carModel);
  destinationBuffer = twgl.createBufferInfoFromArrays(gl, destinationModel);

  // Crear los VAOs para los objetos
  buildingVao = twgl.createVAOFromBufferInfo(gl, programInfo, buildingBufferInfo);
  roadVao = twgl.createVAOFromBufferInfo(gl, programInfo, roadBufferInfo);
  carVao = twgl.createVAOFromBufferInfo(gl, programInfo, carBuffer);
  destinationVao = twgl.createVAOFromBufferInfo(gl, programInfo, destinationBuffer);

  // Configurar la UI
  setupUI();

  // Inicializar el modelo de agentes
  await initAgentsModel();

  // Obtener agentes y obstáculos
  await getCar(); //get agents
  await getBuilding(); //get obstacles
  await getRoads();
  await getDestination();

  // Dibujar la escena
  await drawScene(gl, programInfo, buildingVao, buildingBufferInfo, roadVao, roadBufferInfo, carVao, carBuffer, destinationVao, destinationBuffer);
}

/*
 * Initializes the agents model by sending a POST request to the agent server.
 */
async function initAgentsModel() {
  try {
    // Send a POST request to the agent server to initialize the model
    let response = await fetch(agent_server_uri + "init", {
      method: 'POST', 
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    })

    // Check if the response was successful
    if(response.ok){
      // Parse the response as JSON and log the message
      let result = await response.json()
      console.log(result.message)
    }
      
  } catch (error) {
    // Log any errors that occur during the request
    console.log(error)    
  }
}

async function getRoads() {
  try {
    // Clear the buildings array before adding new obstacles
    roads_array.length = 0;

    // Send a GET request to the agent server to retrieve the obstacle positions
    let response = await fetch(agent_server_uri + "getRoads") 

    // Check if the response was successful
    if(response.ok){
      // Parse the response as JSON
      let result = await response.json()

      // Create new obstacles and add them to the obstacles array
      for (const road of result.positions) {
        const newRoad = new Road(road.id, [road.x, road.y, road.z])
        roads_array.push(newRoad)
      }
      // Log the obstacles array
      console.log("Roads:", roads_array)
    }

  } catch (error) {
    // Log any errors that occur during the request
    console.log(error) 
  }
}

async function getDestination() {
  try {
    // Clear the buildings array before adding new obstacles
    destinations_array.length = 0;

    // Send a GET request to the agent server to retrieve the obstacle positions
    let response = await fetch(agent_server_uri + "getDestination") 

    // Check if the response was successful
    if(response.ok){
      // Parse the response as JSON
      let result = await response.json()

      // Create new obstacles and add them to the obstacles array
      for (const destination of result.positions) {
        const newDestination = new Destination(destination.id, [destination.x, destination.y, destination.z])
        destinations_array.push(newDestination)
      }
      // Log the obstacles array
      console.log("Destinations:", destinations_array)
    }

  } catch (error) {
    // Log any errors that occur during the request
    console.log(error) 
  }
}
/*
 * Retrieves the current positions of all agents from the agent server.
 */
async function getCar() {
  try {
    // Send a GET request to the agent server to retrieve the agent positions
    let response = await fetch(agent_server_uri + "getAgents") 

    // Check if the response was successful
    if(response.ok){
      // Parse the response as JSON
      let result = await response.json()

      // Log the agent positions
      console.log(result.positions)

      // Check if the agents array is empty
      if(agents_array.length == 0){
        // Create new agents and add them to the agents array
        for (const car of result.positions) {
          const newCar = new Car(car.id, [car.x, car.y, car.z])
          agents_array.push(newCar)
        }
        // Log the agents array
        console.log("Agents:", agents_array)

      } else {
        // Update existing agents
        for (let i = 0; i < result.positions.length; i++) {
          agents_array[i].position = [result.positions[i].x, result.positions[i].y, result.positions[i].z];
        }
      }
    }

  } catch (error) {
    // Log any errors that occur during the request
    console.log(error) 
  }
}

/*
 * Retrieves the current positions of all obstacles from the agent server.
 */
async function getBuilding() {
  try {
    // Clear the buildings array before adding new obstacles
    buildings_array.length = 0;

    // Send a GET request to the agent server to retrieve the obstacle positions
    let response = await fetch(agent_server_uri + "getObstacles") 

    // Check if the response was successful
    if(response.ok){
      // Parse the response as JSON
      let result = await response.json()

      // Create new obstacles and add them to the obstacles array
      for (const obstacle of result.positions) {
        const newObstacle = new Building(obstacle.id, [obstacle.x, obstacle.y, obstacle.z])
        buildings_array.push(newObstacle)
      }
      // Log the obstacles array
      console.log("Obstacles:", buildings_array)
    }

  } catch (error) {
    // Log any errors that occur during the request
    console.log(error) 
  }
}

/*
 * Updates the agent positions by sending a request to the agent server.
 */
async function update() {
  try {
    // Send a request to the agent server to update the agent positions
    let response = await fetch(agent_server_uri + "update") 

    // Check if the response was successful
    if(response.ok){
      // Retrieve the updated agent positions
      await getCar()
      // Log a message indicating that the agents have been updated
      console.log("Updated agents")
    }

  } catch (error) {
    // Log any errors that occur during the request
    console.log(error) 
  }
}

/*
 * Draws the scene by rendering the agents and obstacles.
 * 
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {Object} programInfo - The program information.
 * @param {WebGLVertexArrayObject} agentsVao - The vertex array object for agents.
 * @param {Object} agentsBufferInfo - The buffer information for agents.
 * @param {WebGLVertexArrayObject} obstaclesVao - The vertex array object for obstacles.
 * @param {Object} obstaclesBufferInfo - The buffer information for obstacles.
 */
async function drawScene(gl, programInfo, buildingVao, buildingBufferInfo, roadVao, roadBufferInfo, carVao, carBuffer, destinationVao, destinationBuffer) {
    // Configurar el tamaño del canvas y la vista
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(programInfo.program);

    // Configurar la matriz de vista-proyección
    const viewProjectionMatrix = setupWorldView(gl);

    const distance = 1; //Sets the distance from rendering

    // Dibujar agentes y obstáculos
    drawCar(distance, carVao, carBuffer, viewProjectionMatrix); //draw agents
    drawBuildings(distance, buildingVao, buildingBufferInfo, viewProjectionMatrix); //draw obstacles
    drawRoads(distance, roadVao, roadBufferInfo, viewProjectionMatrix); //draw obstacles
    drawDestinations(distance, destinationVao, destinationBuffer, viewProjectionMatrix); //draw obstacles

    frameCount++;
    if (frameCount % 30 == 0) {
      frameCount = 0;
      await update();
    }
    requestAnimationFrame(() => drawScene(gl, programInfo, buildingVao, buildingBufferInfo, roadVao, roadBufferInfo, carVao, carBuffer, destinationVao, destinationBuffer));
}

/*
 * Draws the agents.
 * 
 * @param {Number} distance - The distance for rendering.
 * @param {WebGLVertexArrayObject} agentsVao - The vertex array object for agents.
 * @param {Object} agentsBufferInfo - The buffer information for agents.
 * @param {Float32Array} viewProjectionMatrix - The view-projection matrix.
 */
function drawCar(distance, carVao, carBuffer, viewProjectionMatrix){
    // Bind the vertex array object for agents
    gl.bindVertexArray(carVao);

    // Iterate over the agents
    for(const car of agents_array){

      // Create the agent's transformation matrix
      const car_trans = twgl.v3.create(...car.position);
      const car_scale = twgl.v3.create(...car.scale);

      // Calculate the agent's matrix
      car.matrix = twgl.m4.translate(viewProjectionMatrix, car_trans);
      car.matrix = twgl.m4.rotateX(car.matrix, car.rotation[0]);
      car.matrix = twgl.m4.rotateY(car.matrix, car.rotation[1]);
      car.matrix = twgl.m4.rotateZ(car.matrix, car.rotation[2]);
      car.matrix = twgl.m4.scale(car.matrix, car_scale);

      // Set the uniforms for the agent
      let uniforms = {
          u_matrix: car.matrix,
          u_color: car.color,
      }

      // Set the uniforms and draw the agent
      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, carBuffer);
      
    }
}


function drawBuildings(distance,buildingVao, buildingBuffer, viewProjectionMatrix){
  // Bind the vertex array object for agents
  gl.bindVertexArray(buildingVao);

  // Iterate over the agents
  for(const build of buildings_array){

    // Create the agent's transformation matrix
    const build_trans = twgl.v3.create(...build.position);
    const build_scale = twgl.v3.create(...build.scale);

    // Calculate the agent's matrix
    build.matrix = twgl.m4.translate(viewProjectionMatrix, build_trans);
    build.matrix = twgl.m4.rotateX(build.matrix, build.rotation[0]);
    build.matrix = twgl.m4.rotateY(build.matrix, build.rotation[1]);
    build.matrix = twgl.m4.rotateZ(build.matrix, build.rotation[2]);
    build.matrix = twgl.m4.scale(build.matrix, build_scale);

    // Set the uniforms for the agent
    let uniforms = {
        u_matrix: build.matrix,
        u_color: build.color,
    }

    // Set the uniforms and draw the agent
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, buildingBuffer);
    
  }
}


function drawRoads(distance, roadVao, roadBufferInfo, viewProjectionMatrix){
  // Bind the vertex array object for agents
  gl.bindVertexArray(roadVao);

  // Iterate over the agents
  for(const road of roads_array){

    // Create the agent's transformation matrix
    const road_trans = twgl.v3.create(...road.position);
    const road_scale = twgl.v3.create(...road.scale);

    // Calculate the agent's matrix
    road.matrix = twgl.m4.translate(viewProjectionMatrix, road_trans);
    road.matrix = twgl.m4.rotateX(road.matrix, road.rotation[0]);
    road.matrix = twgl.m4.rotateY(road.matrix, road.rotation[1]);
    road.matrix = twgl.m4.rotateZ(road.matrix, road.rotation[2]);
    road.matrix = twgl.m4.scale(road.matrix, road_scale);

    // Set the uniforms for the agent
    let uniforms = {
        u_matrix: road.matrix,
        u_color: road.color,
    }

    // Set the uniforms and draw the agent
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, roadBufferInfo);
    
  }
}


function drawDestinations(distance, destinationVao, destinationBuffer, viewProjectionMatrix){
  // Bind the vertex array object for agents
  gl.bindVertexArray(destinationVao);

  // Iterate over the agents
  for(const destination of destinations_array){

    // Create the agent's transformation matrix
    const destination_trans = twgl.v3.create(...destination.position);
    const destination_scale = twgl.v3.create(...destination.scale);

    // Calculate the agent's matrix
    destination.matrix = twgl.m4.translate(viewProjectionMatrix, destination_trans);
    destination.matrix = twgl.m4.rotateX(destination.matrix, destination.rotation[0]);
    destination.matrix = twgl.m4.rotateY(destination.matrix, destination.rotation[1]);
    destination.matrix = twgl.m4.rotateZ(destination.matrix, destination.rotation[2]);
    destination.matrix = twgl.m4.scale(destination.matrix, destination_scale);

    // Set the uniforms for the agent
    let uniforms = {
        u_matrix: destination.matrix,
        u_color: destination.color,
    }

    // Set the uniforms and draw the agent
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, destinationBuffer);
    
  }
}

/*
 * Sets up the world view by creating the view-projection matrix.
 * 
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @returns {Float32Array} The view-projection matrix.
 */
function setupWorldView(gl) {
    // Set the field of view (FOV) in radians
    const fov = 45 * Math.PI / 180;

    // Calculate the aspect ratio of the canvas
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    // Create the projection matrix
    const projectionMatrix = twgl.m4.perspective(fov, aspect, 1, 200);

    // Set the target position
    const target = [0,0,0];

    // Set the up vector
    const up = [0, 1, 0];

    // Calculate the camera position
    const camPos = twgl.v3.create(cameraPosition.x + data.width, cameraPosition.y, cameraPosition.z+data.height)

    // Create the camera matrix
    const cameraMatrix = twgl.m4.lookAt(camPos, target, up);

    // Calculate the view matrix
    const viewMatrix = twgl.m4.inverse(cameraMatrix);

    // Calculate the view-projection matrix
    const viewProjectionMatrix = twgl.m4.multiply(projectionMatrix, viewMatrix);

    // Return the view-projection matrix
    return viewProjectionMatrix;
}

/*
 * Sets up the user interface (UI) for the camera position.
 */
function setupUI() {
    // Create a new GUI instance
    const gui = new GUI();

    // Create a folder for the camera position
    const posFolder = gui.addFolder('Position:')

    // Add a slider for the x-axis
    posFolder.add(cameraPosition, 'x', -50, 50)
        .onChange( value => {
            // Update the camera position when the slider value changes
            cameraPosition.x = value
        });

    // Add a slider for the y-axis
    posFolder.add( cameraPosition, 'y', -50, 50)
        .onChange( value => {
            // Update the camera position when the slider value changes
            cameraPosition.y = value
        });

    // Add a slider for the z-axis
    posFolder.add( cameraPosition, 'z', -50, 50)
        .onChange( value => {
            // Update the camera position when the slider value changes
            cameraPosition.z = value
        });
}

function generateData(size) {
    let arrays =
    {
        a_position: {
                numComponents: 3,
                data: [
                  // Front Face
                  -0.5, -0.5,  0.5,
                  0.5, -0.5,  0.5,
                  0.5,  0.5,  0.5,
                 -0.5,  0.5,  0.5,

                 // Back face
                 -0.5, -0.5, -0.5,
                 -0.5,  0.5, -0.5,
                  0.5,  0.5, -0.5,
                  0.5, -0.5, -0.5,

                 // Top face
                 -0.5,  0.5, -0.5,
                 -0.5,  0.5,  0.5,
                  0.5,  0.5,  0.5,
                  0.5,  0.5, -0.5,

                 // Bottom face
                 -0.5, -0.5, -0.5,
                  0.5, -0.5, -0.5,
                  0.5, -0.5,  0.5,
                 -0.5, -0.5,  0.5,

                 // Right face
                  0.5, -0.5, -0.5,
                  0.5,  0.5, -0.5,
                  0.5,  0.5,  0.5,
                  0.5, -0.5,  0.5,

                 // Left face
                 -0.5, -0.5, -0.5,
                 -0.5, -0.5,  0.5,
                 -0.5,  0.5,  0.5,
                 -0.5,  0.5, -0.5
                ].map(e => size * e)
            },
        a_color: {
                numComponents: 4,
                data: [
                  // Front face
                    1, 0, 0, 1, // v_1
                    1, 0, 0, 1, // v_1
                    1, 0, 0, 1, // v_1
                    1, 0, 0, 1, // v_1
                  // Back Face
                    0, 1, 0, 1, // v_2
                    0, 1, 0, 1, // v_2
                    0, 1, 0, 1, // v_2
                    0, 1, 0, 1, // v_2
                  // Top Face
                    0, 0, 1, 1, // v_3
                    0, 0, 1, 1, // v_3
                    0, 0, 1, 1, // v_3
                    0, 0, 1, 1, // v_3
                  // Bottom Face
                    1, 1, 0, 1, // v_4
                    1, 1, 0, 1, // v_4
                    1, 1, 0, 1, // v_4
                    1, 1, 0, 1, // v_4
                  // Right Face
                    0, 1, 1, 1, // v_5
                    0, 1, 1, 1, // v_5
                    0, 1, 1, 1, // v_5
                    0, 1, 1, 1, // v_5
                  // Left Face
                    1, 0, 1, 1, // v_6
                    1, 0, 1, 1, // v_6
                    1, 0, 1, 1, // v_6
                    1, 0, 1, 1, // v_6
                ]
            },
        indices: {
                numComponents: 3,
                data: [
                  0, 1, 2,      0, 2, 3,    // Front face
                  4, 5, 6,      4, 6, 7,    // Back face
                  8, 9, 10,     8, 10, 11,  // Top face
                  12, 13, 14,   12, 14, 15, // Bottom face
                  16, 17, 18,   16, 18, 19, // Right face
                  20, 21, 22,   20, 22, 23  // Left face
                ]
            }
    };

    return arrays;
}

function generateObstacleData(size){

    let arrays =
    {
        a_position: {
                numComponents: 3,
                data: [
                  // Front Face
                  -0.5, -0.5,  0.5,
                  0.5, -0.5,  0.5,
                  0.5,  0.5,  0.5,
                 -0.5,  0.5,  0.5,

                 // Back face
                 -0.5, -0.5, -0.5,
                 -0.5,  0.5, -0.5,
                  0.5,  0.5, -0.5,
                  0.5, -0.5, -0.5,

                 // Top face
                 -0.5,  0.5, -0.5,
                 -0.5,  0.5,  0.5,
                  0.5,  0.5,  0.5,
                  0.5,  0.5, -0.5,

                 // Bottom face
                 -0.5, -0.5, -0.5,
                  0.5, -0.5, -0.5,
                  0.5, -0.5,  0.5,
                 -0.5, -0.5,  0.5,

                 // Right face
                  0.5, -0.5, -0.5,
                  0.5,  0.5, -0.5,
                  0.5,  0.5,  0.5,
                  0.5, -0.5,  0.5,

                 // Left face
                 -0.5, -0.5, -0.5,
                 -0.5, -0.5,  0.5,
                 -0.5,  0.5,  0.5,
                 -0.5,  0.5, -0.5
                ].map(e => size * e)
            },
        a_color: {
                numComponents: 4,
                data: [
                  // Front face
                    0, 0, 0, 1, // v_1
                    0, 0, 0, 1, // v_1
                    0, 0, 0, 1, // v_1
                    0, 0, 0, 1, // v_1
                  // Back Face
                    0.333, 0.333, 0.333, 1, // v_2
                    0.333, 0.333, 0.333, 1, // v_2
                    0.333, 0.333, 0.333, 1, // v_2
                    0.333, 0.333, 0.333, 1, // v_2
                  // Top Face
                    0.5, 0.5, 0.5, 1, // v_3
                    0.5, 0.5, 0.5, 1, // v_3
                    0.5, 0.5, 0.5, 1, // v_3
                    0.5, 0.5, 0.5, 1, // v_3
                  // Bottom Face
                    0.666, 0.666, 0.666, 1, // v_4
                    0.666, 0.666, 0.666, 1, // v_4
                    0.666, 0.666, 0.666, 1, // v_4
                    0.666, 0.666, 0.666, 1, // v_4
                  // Right Face
                    0.833, 0.833, 0.833, 1, // v_5
                    0.833, 0.833, 0.833, 1, // v_5
                    0.833, 0.833, 0.833, 1, // v_5
                    0.833, 0.833, 0.833, 1, // v_5
                  // Left Face
                    1, 1, 1, 1, // v_6
                    1, 1, 1, 1, // v_6
                    1, 1, 1, 1, // v_6
                    1, 1, 1, 1, // v_6
                ]
            },
        indices: {
                numComponents: 3,
                data: [
                  0, 1, 2,      0, 2, 3,    // Front face
                  4, 5, 6,      4, 6, 7,    // Back face
                  8, 9, 10,     8, 10, 11,  // Top face
                  12, 13, 14,   12, 14, 15, // Bottom face
                  16, 17, 18,   16, 18, 19, // Right face
                  20, 21, 22,   20, 22, 23  // Left face
                ]
            }
    };
    return arrays;
}

main()