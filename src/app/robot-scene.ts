import {Scene} from "@/app/scene.ts";
import {fileFromURL} from "@/lib/utils.ts";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {PointLight} from "@/scene/point-light.ts";
import {Vector3} from "@/core/math/vector3.ts";

export class RobotScene extends Scene {
    constructor() {
        super();
        this.name = 'Robot Scene';

    }

    cleanup(): void {

    }

    async initialize(): Promise<void> {
        await super.initialize();
        const objFile = await fileFromURL('/media/models/bot/bot.obj');
        const ro = await OBJLoader.loadMeshes(objFile);
        this.addRenderableObjectArray(ro);
        const texturePath = '/media/models/bot/';
        const materialNames = [
            'robot_steampunk'
        ];

        await this.initializeSceneMaterials(materialNames, texturePath, ['albedo', 'metallic', 'roughness', 'normal', 'emissive', 'ao']);

        const l2 = new PointLight(new Vector3(1, 1, 1), 50);
        l2.transform.position.set(0, 3, 3);
        this.addLight(l2);

        this._initialized = true;
    }

    protected updateScene(): void {

    }

}