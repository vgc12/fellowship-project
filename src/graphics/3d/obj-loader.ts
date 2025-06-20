import { MeshBuilder} from "./mesh.ts";
import {RenderableObject} from "@/scene/renderable-object.ts";

export class OBJLoader {

    uploadInput: HTMLInputElement;


    constructor() {

        this.uploadInput = document.getElementById('file-input') as HTMLInputElement;
        // this.uploadInput.onchange = this.onFileUploaded;
    }


    static async loadMeshes(file: File) {
        const fileContents = await file.text();

        const lines = fileContents.split('\n');

        const meshBuilder = new MeshBuilder();



        const vertices : number[] = [];
        const indices : number[] = [];
        const uvs : number[] = [];
        let name : string = ""
        for (let i = 0; i < lines.length; i++){
            const line = lines[i];

            if(line.startsWith('o ')){
                name = line.substring(2);
            }

            if(i+1 == lines.length || (line.startsWith('o ') && vertices.length > 0)) {
                const mesh = meshBuilder.
                setVertices(vertices)
                    .setIndices(indices)
                    .setUVCoords(uvs)
                    .build();

                const renderableObject = new RenderableObject();
                renderableObject.mesh = mesh;
                renderableObject.transform.position.set(0,0,0);
                renderableObject.name = name
                vertices.length = 0;
                indices.length = 0;
            }
            else if(line.startsWith('v ')) {

                vertices.push(...this.processVertex(line))
            }
            else if (line.startsWith('vt')){
                uvs.push(...this.processUV(line))
            }
            else if(line.startsWith('f ')) {
                indices.push(...this.processFace(line));
            }
        }

    }

    static processVertex(vertex: string) {

        const vertexParts = vertex.split(' ').slice(1);


        return [parseFloat(vertexParts[0]), parseFloat(vertexParts[1]),parseFloat(vertexParts[2])];
    }

    static processFace(face: string): number[] {
        const faceParts = face.split(' ').slice(1); // Remove 'f' part
        const indices: number[] = [];

        // Extract vertex indices (convert from 1-based to 0-based)
        const vertexIndices = faceParts.map(part => {
            // Handle format like "1/1/1" or "1//1" or just "1"

            const index = parseInt(part.split('/')[0]);
            return index - 1; // Convert to 0-based indexing
        });



        // Triangulate the face
        if (vertexIndices.length === 3) {
            // Already a triangle

            indices.push(...vertexIndices);
        } else if (vertexIndices.length === 4) {
            // Quad - split into two triangles
            // Triangle 1: 0, 1, 2
            indices.push(vertexIndices[0], vertexIndices[1], vertexIndices[2],
                         vertexIndices[0], vertexIndices[2], vertexIndices[3]);

        } else {
            // N-gon - use fan triangulation
            for (let i = 1; i < vertexIndices.length - 1; i++) {
                indices.push(vertexIndices[0], vertexIndices[i], vertexIndices[i + 1]);
            }
        }

        return indices;
    }


    static processUV(line: string) {
        const uvParts = line.split(' ').slice(1);

        return [parseFloat(uvParts[0]), parseFloat(uvParts[1])];
    }
}