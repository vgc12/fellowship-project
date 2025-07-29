import {Scene} from "@/app/scene.ts";
import {fileFromURL} from "@/lib/utils.ts";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {PointLight} from "@/scene/point-light.ts";
import {SkyMaterial} from "@/graphics/3d/sky-material.ts";
import {SpotLight} from "@/scene/spot-light.ts";

export class SpaceScene extends Scene {
    cleanup(): void {

    }

    async initialize(): Promise<void> {
        await super.initialize();
        const objFile = await fileFromURL('./media/models/spaceship/corridor.obj');
        await OBJLoader.loadMeshes(objFile);

        const texturePath = './media/models/spaceship/';
        const materialNames = [
            'Floor'
        ];
        const materialTypes = ['Albedo', 'Metallic', 'Roughness', 'Normal', 'Emissive', 'AO'];

        await this.initializeSceneMaterials(materialNames, texturePath, materialTypes)

       this._skyMaterial = new SkyMaterial();

        const path = './media/models/spaceship/skybox/';
        const urls = [
            path + "px.png",    //x+
            path + "nx.png",    //x-
            path + "py.png",    //y+
            path + "ny.png",    //y-
            path + "pz.png",    //z+
            path + "nz.png",    //z-
        ]

        await this._skyMaterial.initialize(urls);

        const p1 = new PointLight(new Vector3(1, 1, 1), 3);
        p1.transform.position.set(-9.7, .5, 0);

        this._initialized = true;
    }

    constructor() {
        super();
        this.name = 'Space Scene';
    }

    protected updateScene(): void {

    }
}