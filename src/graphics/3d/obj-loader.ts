import { MeshBuilder} from "./mesh.ts";
import {RenderableObject} from "@/scene/renderable-object.ts";
import {vec2, type Vec2, vec3, type Vec3} from "wgpu-matrix";



export class OBJLoader {



    private static _vertices: Vec3[] = [];
    private static _uvs: Vec2[] = [];
    private static _result: number[] = [];


    static async loadMeshes(file: File) {
        const fileContents = await file.text();

        const lines = fileContents.split('\n');

        const meshBuilder = new MeshBuilder();

        let name : string = ""

        for (let i = 0; i < lines.length; i++){


            const line = lines[i];



            if(line.startsWith('o ')){
                name = line.substring(2);
            }

            if(i+1 == lines.length || (line.startsWith('o ') && this._vertices.length > 0)) {



                const mesh = meshBuilder
                    .setVertices(this._result)
                    //.setIndices(this._indices)
                    .build();


                const renderableObject = new RenderableObject();
                renderableObject.mesh = mesh;

                renderableObject.name = name

                this._result = []

            }
            else if(line.startsWith('v ')) {

                this.processVertex(line)
            }
            else if(line.startsWith('f ')) {

               this.processFace(line);

            }
            else if (line.startsWith('vt')){

                this.processUV(line)

            }


        }

    }

    // Processes a vertex line, which starts with 'v' and contains 3 float values.
    static processVertex(vertex: string){

        const vertexParts = vertex.replace("\n", "").split(' ').slice(1);

        this._vertices.push( vec3.fromValues(parseFloat(vertexParts[0]), parseFloat(vertexParts[1]),parseFloat(vertexParts[2])));
    }

    // Pairs a vertex with its proper UV coordinate.
    static processIndex(vertexDescription: string){
       /* one vertex description may look like this:
        * 1/1/1
        * where the first number is the vertex index,
        * the second number is the uv index,
        */
        const descriptor = vertexDescription.split('/');

        // extract the vertex and uv indices from the descriptor
        const vIndex = parseInt(descriptor[0])-1;
        const vtIndex = parseInt(descriptor[1])-1;
        // Find the vertex in the vertices array based on the index.
        const v = this._vertices[vIndex]
        // Find the uv coordinate in the uvs array based on the index.
        const vt = this._uvs[vtIndex]

        if (!v) {

            return;
        }

        // push the vertex and uv coordinate to the result array.
        // one entry in the result array will look like this:
        // [x, y, z, u, v]
        this._result.push(...v)
        this._result.push(...vt)

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
        for (let i = 0; i < triangleCount; i++){

            this.processIndex(faceParts[0]);
            this.processIndex(faceParts[i+1]);
            this.processIndex(faceParts[i+2])
        }


    }


    static processUV(line: string) {
        const uvParts = line.split(' ').slice(1);

        this._uvs.push( vec2.fromValues( parseFloat(uvParts[0]),1-parseFloat(uvParts[1])));

    }


}