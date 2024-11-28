/* 
Julian Ramirez 
A01027743
*/
import fs from 'fs';

function loadObj(Loaded_OBJ) {

    // Ensure Loaded_OBJ is a string
    if (typeof Loaded_OBJ !== 'string') {
        throw new Error('Loaded_OBJ must be a string');
    }

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
        indices: {
            numComponents: 3,
            data: []
        }
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
            const indices = [];
            for (const vertex of face) {
                const parts = vertex.split('/');
        
                // Maneja el índice del vértice
                const vIndex = parseInt(parts[0]) - 1;
                indices.push(vIndex);
        
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
            result.indices.data.push(...indices);
        }
        
    }


    
    // para llenar el a_color
    for (let i = 0; i < result.a_position.data.length / 3; i++) {
        result.a_color.data.push(0.4, 0.4, 0.4, 1);
    }


    return result;
}

export { loadObj };
