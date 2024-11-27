/* 
Julian Ramirez 
A01027743

Este codigo a partir de inputs dados por un usuario,
genera un modelo de una rueda

*/
import fs from 'fs';

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



/* 
Crear funcion que reciba un string que sea un archivo .OBJ, y retorne un JSON
*/

function loadObj(Loaded_OBJ) {

    //Estrucrura del JSON
    const result = {
        a_position: {
            numComponents: 3,
            data: []
        },
        a_color: {
            numComponents: 4,
            data: []
        },
        a_normal: {
            numComponents: 3,
            data: []
        },
    };

    const vertices = [];
    const normals = [];

    // Divide el contenido en líneas y procesa cada línea
    const lines = Loaded_OBJ.split('\n');
    for (let line of lines) {
        line = line.trim();
        
        // Si la línea empieza con 'v ', es un vértice
        if (line.startsWith('v ')) {
            const [, x, y, z] = line.split(/\s+/).map(Number);
            vertices.push(x, y, z);
        }
        // Si la línea empieza con 'vn ', es una normal
        else if (line.startsWith('vn ')) {
            const [, x, y, z] = line.split(/\s+/).map(Number);
            normals.push(x, y, z);
        }
        // Si la línea empieza con 'f ', es una cara
        else if (line.startsWith('f ')) {
            const face = line.slice(2).trim().split(' ');
            for (const vertex of face) {
                const parts = vertex.split('/');
        
                // Maneja el índice del vértice
                const vIndex = parseInt(parts[0]) - 1;
        
                // Maneja el índice de la normal (si existe)
                const nIndex = parts[2] ? parseInt(parts[2]) - 1 : -1;
        
                // Agrega las coordenadas de posición del vértice
                result.a_position.data.push(
                    vertices[vIndex * 3],
                    vertices[vIndex * 3 + 1],
                    vertices[vIndex * 3 + 2]
                );
        
                // Agrega los vectores normales
                if (nIndex >= 0) {
                    result.a_normal.data.push(
                        normals[nIndex * 3],
                        normals[nIndex * 3 + 1],
                        normals[nIndex * 3 + 2]
                    );
                }
            }
        }
        
    }


    
    // para llenar el a_color
    for (let i = 0; i < result.a_position.data.length / 3; i++) {
        result.a_color.data.push(0.4, 0.4, 0.4, 1);
    }


    return result;
}

const Loaded_OBJ = fs.readFileSync('wheel.obj', 'utf8');
const jsonObject = loadObj(Loaded_OBJ);
fs.writeFileSync('wheel.json', JSON.stringify(jsonObject, null, 2));
console.log("Archivo JSON creado exitosamente");
