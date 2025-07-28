import {fileFromURL} from "@/lib/utils.ts";

import {Material} from "@/graphics/3d/material.ts";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {PointLight} from "@/scene/point-light.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {Scene} from "@/app/scene.ts";

export class BathroomScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Bathroom Scene';

    }


    async initialize(): Promise<void> {
        await super.initialize();

        const objFile = await fileFromURL('./media/models/bathroom/bathroom.obj');
        await OBJLoader.loadMeshes(objFile);

        const texturePath = './media/models/bathroom/';
        const materialNames = [
            'Bath',
            'Bathtube',
            'Candle',
            'Cups',
            'Fabric',
            'Floor',
            'Frames',
            'Selling_Bump',
            'Wall_trim',
            'WinDoorsheet',

        ];
        const materialTypes =  ['Albedo', 'Metallic', 'Roughness', 'Normal', 'Opacity']
        await this.initializeSceneMaterials(materialNames, texturePath, materialTypes)


        const l1 = new PointLight(new Vector3(1, 1, 1), 3);
        this._initialized = true;
    }


    protected updateScene(): void {

    }

}