function shapes(size) {
    const grayColor = [0.5, 0.5, 0.5, 1]; // Color gris con transparencia 1
    let arrays = {
        a_position: {
            numComponents: 3,
            data: [
                // Front face
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
                // Repeat the gray color for each vertex
                ...Array(24).fill(grayColor).flat()
            ]
        },
        a_normal: {
            numComponents: 3,
            data: [
                // Front face
                 0,  0,  1,
                 0,  0,  1,
                 0,  0,  1,
                 0,  0,  1,

                // Back face
                 0,  0, -1,
                 0,  0, -1,
                 0,  0, -1,
                 0,  0, -1,

                // Top face
                 0,  1,  0,
                 0,  1,  0,
                 0,  1,  0,
                 0,  1,  0,

                // Bottom face
                 0, -1,  0,
                 0, -1,  0,
                 0, -1,  0,
                 0, -1,  0,

                // Right face
                 1,  0,  0,
                 1,  0,  0,
                 1,  0,  0,
                 1,  0,  0,

                // Left face
                -1,  0,  0,
                -1,  0,  0,
                -1,  0,  0,
                -1,  0,  0
            ]
        }
    };

    return arrays;
}
