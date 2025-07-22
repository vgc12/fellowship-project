import {MeshBuilder} from "./mesh.ts";
import {RenderableObject} from "@/scene/renderable-object.ts";
import {vec2, type Vec2, vec3, type Vec3} from "wgpu-matrix";

interface IVertexData {
    position: Vec3;
    uv: Vec2;
    normal: Vec3;
    tangent?: Vec3;
    bitangent?: Vec3;
}

export class OBJLoader {


    private static _vertices: Vec3[] = [];
    private static _uvs: Vec2[] = [];
    private static _normals: Vec2[] = [];
    private static _result: number[] = [];
    private static _vertexData: IVertexData[] = [];


    static async loadMeshes(file: File) {
        const fileContents = await file.text();

        const lines = fileContents.split('\n');

        const meshBuilder = new MeshBuilder();

        let name: string = ""


        for (let i = 0; i < lines.length; i++) {


            const line = lines[i];


            if (line.startsWith('o ')) {
                name = line.substring(2);
            }

            if (i + 1 == lines.length || (line.startsWith('o ') && this._vertices.length > 0)) {

                this.calculateTangents(this._vertexData);


                const mesh = meshBuilder
                    .setVertices(this._result)
                    .build();


                const renderableObject = new RenderableObject();
                renderableObject.mesh = mesh;

                renderableObject.name = name

                this._result = []
                this._vertexData = [];


            } else if (line.startsWith('v ')) {

                this.processVertex(line)

            } else if (line.startsWith('f ')) {

                this.processFace(line);

            } else if (line.startsWith('vn')) {

                this.processNormal(line)

            } else if (line.startsWith('vt')) {

                this.processUV(line)

            }


        }

        this._vertices = [];
        this._uvs = [];
        this._normals = [];
        this._result = [];
        this._vertexData = [];
    }

    // Fixes bug if there are multiple spaces in the line.
    // Returns an array of numbers from the line.
    private static getNumberArray(line: string) {
        return line.match(/-*\d*\.\d*/g)?.map(parseFloat) || [];
    }

    // Processes a vertex line, which starts with 'v' and contains 3 float values.
    static processVertex(vertex: string) {
        const vertexParts = this.getNumberArray(vertex);
        this._vertices.push(vec3.fromValues(vertexParts[0], vertexParts[1], vertexParts[2]));
    }

    // Pairs a vertex with its proper UV coordinate.
    static processIndex(vertexDescription: string) {
        /* one vertex description may look like this:
         * 1/1/1
         * where the first number is the vertex index,
         * the second number is the uv index,
         * and the third number is the normal index.
         */
        const descriptor = vertexDescription.split('/');

        // extract the vertex and uv indices from the descriptor
        const vIndex = parseInt(descriptor[0]) - 1;
        const vtIndex = parseInt(descriptor[1]) - 1;
        const vnIndex = parseInt(descriptor[2]) - 1;
        // Find the vertex in the vertices array based on the index.
        const v = this._vertices[vIndex]
        // Find the uv coordinate in the uvs array based on the index.
        const vt = this._uvs[vtIndex]

        const vn = this._normals[vnIndex];

        if (!v) {

            return;
        }

        // push the vertex and uv coordinate to the result array.
        // one entry in the result array will look like this:
        // [x, y, z, u, v, nx, ny, nz]

        this._vertexData.push({
            position: v,
            uv: vt,
            normal: vn
        })
    }

    // Calculate tangents for the loaded mesh
    private static calculateTangents(vertices: IVertexData[]): IVertexData[] {
        // Initialize tangent and bitangent accumulators
        const tangents = vertices.map(() => vec3.create(0, 0, 0));
        const bitangents = vertices.map(() => vec3.create(0, 0, 0));

        // Process each triangle (every 3 vertices)
        for (let i = 0; i < vertices.length; i += 3) {

            if( i + 2 >= vertices.length) {
                console.warn(`Skipping incomplete triangle at index ${i}. Not enough vertices.`);
                continue; // Skip if there are not enough vertices for a triangle
            }

            const v0 = vertices[i];
            const v1 = vertices[i+1];
            const v2 = vertices[i+2];

            // Position deltas
            const edge0 = vec3.sub(v1.position, v0.position);
            const edge1 = vec3.sub(v2.position, v0.position);

            // UV deltas
            const deltaUV0 = vec2.sub(v1.uv, v0.uv);
            const deltaUV1 = vec2.sub(v2.uv, v0.uv);

            // Calculate the tangent and bitangent vectors
            // Handle degenerate case
            const det = deltaUV0[0] * deltaUV1[1] - deltaUV1[0] * deltaUV0[1];
            if (Math.abs(det) < 1e-6) {
                continue;
            }

            const inverseDeterminant = 1.0 / det;


            const tangent = vec3.scale(vec3.sub(
                vec3.scale(edge0, deltaUV1[1]),
                vec3.scale(edge1, deltaUV0[1])
            ), inverseDeterminant);


            const bitangent = vec3.scale(
                vec3.sub(
                    vec3.scale(edge1, deltaUV0[0]),
                    vec3.scale(edge0, deltaUV1[0])
                ),
                inverseDeterminant
            );

            // Accumulate for each vertex of the triangle
            for (let j = 0; j < 3; j++) {
                const idx = i + j;
                tangents[idx] = tangent
                bitangents[idx] = bitangent
            }


        }

        vertices.forEach((vertex, i) => {
            const normal = vertex.normal;
            let tangent = vec3.normalize(tangents[i]);
            let bitangent = vec3.normalize(bitangents[i]);

            // Gram-Schmidt orthogonalize tangent against normal
            const dot = vec3.dot(tangent, normal);
            tangent = vec3.normalize(vec3.sub(tangent, vec3.scale(normal, dot)));

            // Calculate handedness and correct bitangent
            const cross = vec3.cross(normal, tangent);
            const handedness = vec3.dot(cross, bitangent) < 0 ? -1 : 1;
            bitangent = vec3.scale(cross, handedness);

            vertex.tangent = tangent;
            vertex.bitangent = bitangent;

            this._result.push(...vertex.position)

            this._result.push(...vertex.uv);
            this._result.push(...vertex.normal);
            this._result.push(...vertex.tangent);
            this._result.push(...vertex.bitangent);

        })

        return vertices;
    }

    // Forms triangle(s) from the face description.
    static processFace(line: string) {

        /* the face line may look like this:
         * f 1/1/1 2/2/2 3/3/3 4/4/4
         * where each group is split like vertex_index/uv_index/normal_index
         * this function searches the already made vertices and uv arrays
         * and creates triangles based on these indices.
         */
        const faceParts = line.split(' ').slice(1);

        const triangleCount = faceParts.length - 2;

        /* Assembles the triangles from the face description.
         * If the face has 3 vertices, like this:
         * f 1/1/1 2/2/2 3/3/3
         * it will create one triangle from the first three vertices.
         * If the face has 4 or more vertices, like this:
         * f 1/1/1 2/2/2 3/3/3 4/4/4
         * a triangle gets created from the first three (1/1/1 2/2/2 3/3/3)
         * and then from the first vertex, and the next two vertices (1/1/1 3/3/3 4/4/4).
         */
        for (let i = 0; i < triangleCount; i++) {

            this.processIndex(faceParts[0]);
            this.processIndex(faceParts[i + 1]);
            this.processIndex(faceParts[i + 2])
        }


    }


    static processUV(line: string) {
        const uvParts = this.getNumberArray(line);

        this._uvs.push(vec2.fromValues(uvParts[0], 1 - uvParts[1]));

    }


    private static processNormal(line: string) {
        const normalParts = this.getNumberArray(line);
        this._normals.push(vec3.fromValues(normalParts[0], normalParts[1], normalParts[2]));
    }
}