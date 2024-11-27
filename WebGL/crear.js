/* 
Julian Ramirez 
A01027743
*/
import fs from 'fs';



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

const Loaded_OBJ = fs.readFileSync('cube.obj', 'utf8');
const jsonObject = loadObj(Loaded_OBJ);
fs.writeFileSync('cube.json', JSON.stringify(jsonObject, null, 2));
console.log("Archivo JSON creado exitosamente");