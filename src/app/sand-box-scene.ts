import {fileFromURL} from "@/lib/utils.ts";

import {Material} from "@/graphics/3d/material.ts";
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

        const objFile = await fileFromURL('./media/models/textures/corridor.obj');
        await OBJLoader.loadMeshes(objFile);

        const texturePath = './media/models/textures/';
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
        const materials = new Map<string, Material>();
        for (const m of materialNames) {
            const material = await Material.createFromFolderPath(m, texturePath);
            await material.initialize();
            materials.set(m, material);
        }


        this.renderableObjects.forEach(r => {
            r.material = materials.get(r.materialName) ?? Material.default;
        })

        const l1 = new PointLight(new Vector3(1, 1, 1), 100);
        l1.transform.position.set(-59.1, 198.1, 75.3);
        new PointLight(new Vector3(1, 1, 1), 50);
    }


    protected updateScene(): void {

    }

}