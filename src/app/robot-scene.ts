import {Scene} from "@/app/scene.ts";
import {fileFromURL} from "@/lib/utils.ts";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {PointLight} from "@/scene/point-light.ts";
import {Vector3} from "@/core/math/vector3.ts";

export class RobotScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Robot Scene';

    }


    async initialize(): Promise<void> {
        await super.initialize();
        const objFile = await fileFromURL('./media/models/bot/bot.obj');
        await OBJLoader.loadMeshes(objFile);

        const texturePath = './media/models/bot/';
        const materialNames = [
            'robot_steampunk'
        ];

        await this.initializeSceneMaterials(materialNames, texturePath, ['albedo', 'metallic', 'roughness', 'normal', 'emissive', 'ao']);

        const l1 = new PointLight(new Vector3(1, 1, 1), 100);
        l1.transform.position.set(-59.1, 198.1, 75.3);
        new PointLight(new Vector3(1, 1, 1), 50);

        this._initialized = true;
    }

    protected updateScene(): void {

    }

}