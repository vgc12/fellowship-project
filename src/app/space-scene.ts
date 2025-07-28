import {Scene} from "@/app/scene.ts";
import {fileFromURL} from "@/lib/utils.ts";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {Material} from "@/graphics/3d/material.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {PointLight} from "@/scene/point-light.ts";

export class SpaceScene extends Scene {
    cleanup(): void {

    }

    async initialize(): Promise<void> {
        await super.initialize();
        const objFile = await fileFromURL('./media/models/spaceship/spaceship.obj');
        await OBJLoader.loadMeshes(objFile);

        const texturePath = './media/models/spaceship/';
        const materialNames = [
            'Space_ship_chair_screens_lamps',
            'Space_ship_Exterior',
            'Space_ship_interior_base',
            'Space_ship_phone_and_speed_control'
        ];
        const materialTypes = ['Albedo', 'Metallic', 'Roughness', 'Normal'];

        await this.initializeSceneMaterials(materialNames, texturePath, materialTypes)

        new PointLight(new Vector3(1, 1, 1), 100);
        this._initialized = true;
    }

    constructor() {
        super();
        this.name = 'Space Scene';
    }

    protected updateScene(): void {

    }
}