
import { Renderer } from './renderer.ts';
import {$WGPU} from "./webgpu-device.ts";

export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;


    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.canvas = canvas;

    }

    async initialize() {
        await this.renderer.initialize();

    }

    run = async () => {


        $WGPU.objects.forEach(o => {
            o.update()

        });

        this.renderer.update();

        requestAnimationFrame(this.run)
    };


}
