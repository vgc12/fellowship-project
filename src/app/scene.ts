import type {IObject} from "@/scene/IObject.ts";

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

    get renderableObjects(): RenderableObject[] {
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

    get initialized() {
        return this._initialized;
    }


    private readonly _objects: IObject[];
    private readonly _renderableObjects: RenderableObject[];
    private readonly _lights: Light[];
    private _name: string;
    private readonly _guid: string;
    protected readonly _initialized: boolean;

    protected constructor() {

        this._objects = [];
        this._renderableObjects = [];
        this._lights = [];
        this._name = 'Default Scene'
        this._guid = crypto.randomUUID();

    }

    protected abstract updateScene(): void;

    async initialize() {

    }

    abstract cleanup(): void;

    run = async () => {


        this.objects.forEach(o => {
            o.update()

        });

        $WGPU.renderer.update();

        this.updateScene();

        requestAnimationFrame(this.run)


    };


}

export type MaterialFiles = {
    albedoFile: File,
    roughnessFile: File,
    metallicFile: File,
    normalFile: File
};

