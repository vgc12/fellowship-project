import {Renderer} from "@/core/renderer/renderer.ts";
import type {IObject} from "@/scene/IObject.ts";
import type {IRenderable} from "@/scene/IRenderable.ts";
import  {type RenderableObject} from "@/scene/renderable-object.ts";
import  {type Light} from "@/scene/point-light.ts";





export abstract class Scene {
    get lights(): Light[] {
        return this._lights;
    }
    get renderableObjects(): IRenderable[] {
        return this._renderableObjects;
    }

    get objects(): IObject[] {
        return this._objects;
    }

    addRenderableObject(renderable: RenderableObject) {
        this._renderableObjects.push(renderable);
    }



    addObject(object: IObject) {
        this._objects.push(object);
    }

    addLight(light: Light) {
        this._lights.push(light);
    }




    protected renderer: Renderer;
    private _objects: IObject[] = [];
    private _renderableObjects: RenderableObject[];
    private _lights: Light[];




    protected constructor() {
        this.renderer = new Renderer();
        this._objects = [];
        this._renderableObjects = [];
        this._lights = [];

    }

    protected abstract updateScene() : void;
    abstract cleanup() : void;

    run = async () => {


        this.objects.forEach(o => {
            o.update()

        });

        this.renderer.update();


        requestAnimationFrame(this.run)


    };


}

export class SandBoxScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();

    }

    protected updateScene(): void {

    }

}

export class TVScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();

    }

    protected updateScene(): void {

    }

}

export class SpaceScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();

    }

    protected updateScene(): void {

    }
}

