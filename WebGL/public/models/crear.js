/* 
Julian Ramirez 
A01027743

Este codigo a partir de inputs dados por un usuario,
genera un modelo de una rueda

*/
import fs from 'fs';
const path = require('path');

// Leer inputs o usar valores predeterminados
const args = process.argv.slice(2);
const numLados = parseInt(args[0]) || 4;  // numero de lados del circulo
const radio = parseFloat(args[1]) || 1.0;  // radio de la rueda
const anchoRueda = parseFloat(args[2]) || 1.0;  // ancho de la rueda

// Validar inputs
if (numLados < 3 || numLados > 360 || radio <= 0 || anchoRueda <= 0) {
    console.error("parametros incorrectos, generando archivo predeterminado");
    process.exit(1);
}

const n_vertices = [];
const vectores_normales = [];
const n_faces = [];

// generar los vertices para el circulo
for (let i = 0; i < numLados; i++) {
    const angle = (2 * Math.PI * i) / numLados;
    const x = radio * Math.cos(angle);
    const y = radio * Math.sin(angle);

    n_vertices.push(`v ${x.toFixed(4)} ${y.toFixed(4)} ${(anchoRueda / 2).toFixed(4)}`);
    n_vertices.push(`v ${x.toFixed(4)} ${y.toFixed(4)} ${(-anchoRueda / 2).toFixed(4)}`);
}

// Generar las caras para los extremos del círculo
for (let i = 0; i < numLados; i++) {
    const nextIndex = (i + 1) % numLados;
    
    n_faces.push(`f ${i * 2 + 1}//1 ${(nextIndex * 2 + 1)}//1 ${numLados * 2 + 1}//1`);
    n_faces.push(`f ${numLados * 2 + 2}//2 ${(nextIndex * 2 + 2)}//2 ${(i * 2 + 2)}//2`);
}

// Agregar los vértices centrales de cada cara
n_vertices.push(`v 0.0 0.0 ${(anchoRueda / 2).toFixed(4)}`);
n_vertices.push(`v 0.0 0.0 ${(-anchoRueda / 2).toFixed(4)}`);

// Formar las caras laterales
for (let i = 0; i < numLados; i++) {
    const nextIndex = (i + 1) % numLados;
    const top1 = i * 2 + 1;
    const top2 = nextIndex * 2 + 1;
    const bottom1 = i * 2 + 2;
    const bottom2 = nextIndex * 2 + 2;

    n_faces.push(`f ${top1}//3 ${bottom1}//3 ${bottom2}//3`);
    n_faces.push(`f ${top1}//3 ${bottom2}//3 ${top2}//3`);
}

// Agregar los normales
vectores_normales.push("vn 0.0 0.0 1.0");  
vectores_normales.push("vn 0.0 0.0 -1.0"); 
vectores_normales.push("vn 1.0 0.0 0.0");  

// Contenido del archivo OBJ
const objContent = [
    //Vertices 
    ...n_vertices,
    
    
    //Vectores normales
    ...vectores_normales,
    

    //Faces
    ...n_faces,
].join('\n');

// Crear archivo
fs.writeFileSync('./../public/wheel.obj', objContent);
console.log("archivo creado exitosamente");

// Function to parse OBJ file
function parseOBJ(filePath) {
    const objData = fs.readFileSync(filePath, 'utf8');
    const lines = objData.split('\n');
    const vertices = [];
    const faces = [];

    lines.forEach(line => {
        const parts = line.trim().split(' ');
        if (parts[0] === 'v') {
            vertices.push(parts.slice(1).map(Number));
        } else if (parts[0] === 'f') {
            faces.push(parts.slice(1).map(part => part.split('/')[0] - 1));
        }
    });

    return { vertices, faces };
}

// Function to convert OBJ to JSON
function convertOBJToJson(objFilePath, jsonFilePath) {
    const objData = parseOBJ(objFilePath);
    fs.writeFileSync(jsonFilePath, JSON.stringify(objData, null, 2));
}

// Define file paths
const objFilePath = path.join(__dirname, 'building.obj');
const jsonFilePath = path.join(__dirname, 'building.json');

// Convert OBJ to JSON
convertOBJToJson(objFilePath, jsonFilePath);
console.log('OBJ file converted to JSON successfully.');
