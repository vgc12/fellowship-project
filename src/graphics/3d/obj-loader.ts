import { MeshBuilder} from "./mesh.ts";
import {RenderableObject} from "@/scene/renderable-object.ts";
import {vec2, type Vec2, vec3, type Vec3} from "wgpu-matrix";



export class OBJLoader {

    uploadInput: HTMLInputElement;

    private static _vertices: Vec3[] = [];
    private static _uvs: Vec2[] = [];
    private static _result: number[] = [];
    private static _indices : number[] = [];



    constructor() {

        this.uploadInput = document.getElementById('file-input') as HTMLInputElement;
        // this.uploadInput.onchange = this.onFileUploaded;
    }


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



                console.log(this._indices.length/3)
                const mesh = meshBuilder
                    .setVertices(this._result)
                    //.setIndices(this._indices)
                    .build();


                const renderableObject = new RenderableObject();
                renderableObject.mesh = mesh;

                renderableObject.name = name

                this._result = []
                this._indices = []



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

    static processVertex(vertex: string){

        const vertexParts = vertex.replace("\n", "").split(' ').slice(1);

        this._vertices.push( vec3.fromValues(parseFloat(vertexParts[0]), parseFloat(vertexParts[1]),parseFloat(vertexParts[2])));
    }


    static processIndex(vertexDescription: string){

        const descriptor = vertexDescription.split('/');

        const vIndex = parseInt(descriptor[0])-1;
        const vtIndex = parseInt(descriptor[1])-1;



        const v = this._vertices[vIndex]
        const vt = this._uvs[vtIndex]


        if (!v) {

            console.log(`${this._vertices[vIndex]}}`)
            return;
        }


        this._result.push(...v)
        this._result.push(...vt)

    }


    static processFace(line: string) {

        const faceParts = line.split(' ').slice(1);

        const triangleCount = faceParts.length - 2;

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