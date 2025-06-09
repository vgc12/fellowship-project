
import {Renderer} from "./renderer.ts";

export class App{
    canvas: HTMLCanvasElement
    renderer: Renderer;


    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.canvas = canvas;

    }

    async initialize(){
        await this.renderer.initialize();
    }




}