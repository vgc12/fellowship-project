import type {IObject} from "@/scene/IObject.ts";

import {type RenderableObject} from "@/scene/renderable-object.ts";
import {type Light} from "@/scene/point-light.ts";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {Material} from "@/graphics/3d/material.ts";
import {SkyMaterial} from "@/graphics/3d/sky-material.ts";
import {CameraController} from "@/Controls/camera-controller.ts";




export abstract class Scene {
    get skyMaterial(){
        return this._skyMaterial;
    }
    get running(): boolean {
        return this._running;
    }

    set running(value: boolean) {
        this._running = value;
    }
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
    protected  _initialized: boolean;
    private _running: boolean;
    protected _skyMaterial: SkyMaterial;
    protected cameraController: CameraController;



    protected constructor() {

        this._objects = [];
        this._renderableObjects = [];
        this._lights = [];
        this._name = 'Default Scene'
        this._guid = crypto.randomUUID();
        this._skyMaterial = SkyMaterial.default;


    }

    protected abstract updateScene( ): void;

    // this used to be not as complex, but it would genuinely take 6 seconds to do this per scene which is about 20 seconds of waiting
    // to initialize all scenes its around 6-10 seconds total (depending on your pc);
    protected async initializeSceneMaterials(materialNames: string[], texturePath: string, materialTypes: string[] = ['albedo', 'roughness', 'metallic', 'normal', 'emissive', 'opacity']) {
        const materials = new Map<string,Material>();

        const materialPromises = materialNames.map(async (m) => {

            const material = await Material.createFromFolderPath(m, texturePath, materialTypes);

            // does not need to be awaited
            material.initialize();

            return { name: m, material };
        });

        const results = await Promise.all(materialPromises);

        results.forEach(m => {
            materials.set(m.name, m.material);
        })

        this.renderableObjects.forEach(r => {
            r.material = materials.get(r.materialName) ?? Material.default;
        })
    }

    async initialize() {
        this._skyMaterial = SkyMaterial.default;

        if(!this._objects.includes($WGPU.mainCamera)){
            this._objects.push($WGPU.mainCamera);
        }

        if(!this._objects.includes($WGPU.cameraController)){
            this.cameraController = new CameraController($WGPU.mainCamera);
            this._objects.push(this.cameraController);
        }
    }
    async start() {
        this._running = true
        await this.run();
    }

    cleanup() {
        this._running = false;
    }



    run = async () => {

        if(!this._running) return;

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
    normalFile: File,
    aoFile: File,
    opacityFile: File
};

