export class Cube {

    vertices: Float32Array;

    indices: Uint16Array;

    constructor() {
        // Define the vertices of a cube
        // X, Y, Z coordinates for each vertex
        this.vertices = new Float32Array([
            1,1,0,
            0,1,0,
            0,1,1,
            1,1,1,
            1,0,0,
            1,0,1,
            0,0,1,
            0,0,0
        ])

        // Define the indices that connect the vertices to form triangles
        this.indices = new Uint16Array([
            0,1,2, // top triangle
            0,2,3, // top triangle
            0,4,7, // back left triangle
            0,7,1, // back left triangle
            1,2,7, // back right triangle
            2,6,7, // back right triangle
            3,5,6, // front right triangle
            3,6,2, // front right triangle
            4,6,3, // front left triangle
            0,3,4, // front left triangle
            4,5,6, // bottom triangle
            4,6,7  // bottom triangle
        ])
    }
}