import type {IObject} from "@/scene/IObject.ts";
import type {IRenderable} from "@/scene/IRenderable.ts";
import {type RenderableObject} from "@/scene/renderable-object.ts";
import {type Light} from "@/scene/point-light.ts";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";

export abstract class Scene {
    get guid(): string {
        return this._guid;
    }

    get name(): string {
        return this._name;
    }

    protected set name(name) {
        this._name = name;
    }

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


    private _objects: IObject[];
    private _renderableObjects: RenderableObject[];
    private _lights: Light[];
    private _name: string;
    private _guid: string;


    protected constructor() {

        this._objects = [];
        this._renderableObjects = [];
        this._lights = [];
        this._name = 'Default Scene'
        this._guid = crypto.randomUUID();

    }

    protected abstract updateScene(): void;

    abstract cleanup(): void;

    run = async () => {


        this.objects.forEach(o => {
            o.update()

        });

        $WGPU.renderer.update();


        requestAnimationFrame(this.run)


    };


}

export class SandBoxScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Sandbox Scene';
    }

    protected updateScene(): void {

    }

}

export class TVScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Television Scene';
    }

    protected updateScene(): void {

    }

}

export class SpaceScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Space Scene';
    }

    protected updateScene(): void {

    }
}

