import {Scene} from "@/app/scene.ts";
import {fileFromURL} from "@/lib/utils.ts";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {Material} from "@/graphics/3d/material.ts";

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
        const materials = new Map<string, Material>();
        for (const m of materialNames) {
            const material = await Material.createFromFolderPath(m, texturePath, ['Albedo', 'Metallic', 'Roughness', 'Normal']);
            await material.initialize();
            materials.set(m, material);
        }


        this.renderableObjects.forEach(r => {
            r.material = materials.get(r.materialName) ?? Material.default;
        })
    }

    constructor() {
        super();
        this.name = 'Space Scene';
    }

    protected updateScene(): void {

    }
}