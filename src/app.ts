
import { Renderer } from './renderer.ts';
import {$WGPU} from "./webgpu-singleton.ts";
import {RenderableObject} from "./renderable-object.ts";
import {Mesh, MeshBuilder} from "./mesh.ts";
import {$TIME} from "./time.ts";




export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;


    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer();
        this.canvas = canvas;

    }

    async initialize() {
        await $WGPU.initialize();
        await this.renderer.initialize();
        await $TIME.initialize();

        const meshBuilder = new MeshBuilder();

        const mesh : Mesh =  meshBuilder.setVertices(new Float32Array([
                1,1,-1, // yellow
                -1,1,-1,
                -1,1,1,
                1,1,1, // 3 top yellow
                1,-1,-1, // 4 red
                1,-1,1, //5 pink
                -1,-1,1, // 6 blue
                -1,-1,-1, // 7 black
            ]),
        ).setIndices(new Uint16Array([
            0,1,2,
            0,2,3,
            0,4,7,
            0,7,1,
            1,2,7,
            2,6,7,
            3,5,6,
            3,6,2,
            3,4,5,
            0,3,4,
            5,4,6,
            4,6,7,

        ])).build();

        for(let i = 0; i < 10; i++) {
           const obj = new RenderableObject();
           obj.mesh = mesh;
           // this is just an arbitrary position that allows you to see each cube with a good distance between them
           obj.transform.setPosition(-18 +(i*4),0,25);

        }

    }

    run = async () => {


        $WGPU.objects.forEach(o => {
            o.update()
        });


        const rotation =   2*(360) * $TIME.deltaTime % 360 ;

        $WGPU.objects.forEach(o => {
            if(o.name != "camera") {

                o.transform.addRotation(0, rotation * Math.random(), rotation * Math.random());
            }
        })


        this.renderer.update();

        requestAnimationFrame(this.run)
      


    };


}


