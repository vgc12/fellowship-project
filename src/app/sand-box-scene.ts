import {fileFromURL} from "@/lib/utils.ts";

import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {PointLight} from "@/scene/point-light.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {Scene} from "@/app/scene.ts";

export class SandBoxScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Sandbox Scene';

    }


    async initialize(): Promise<void> {
        await super.initialize();
        const objFile = await fileFromURL('./media/models/corridor/corridor.obj');
        await OBJLoader.loadMeshes(objFile);

        const texturePath = './media/models/corridor/';
        const materialNames = [
            'Fenetre',
            'Sac',
            'Sol',
            'Tablier_moulures',
            'Vitre',
            'Lampes',
            'murs',
            'Plafond',
            'Porte_D',
            'Porte_G'
        ];

        await this.initializeSceneMaterials(materialNames, texturePath)

        const l1 = new PointLight(new Vector3(1, 1, 1), 100);
        l1.transform.position.set(-59.1, 198.1, 75.3);
        new PointLight(new Vector3(1, 1, 1), 50);

        this._initialized = true;
    }

    protected updateScene(): void {

    }

}