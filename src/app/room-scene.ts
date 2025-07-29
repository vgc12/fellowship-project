import {fileFromURL} from "@/lib/utils.ts";

import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {PointLight} from "@/scene/point-light.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {Scene} from "@/app/scene.ts";
import {SkyMaterial} from "@/graphics/3d/sky-material.ts";

export class RoomScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Bedroom Scene';

    }


    async initialize(): Promise<void> {
        await super.initialize();


        const materialTypes =  ['Albedo', 'Metallic', 'Roughness', 'Normal', 'Opacity', 'AO', 'Emissive']

        const objFile = await fileFromURL('./media/models/room/room.obj');
        await OBJLoader.loadMeshes(objFile);


        const roomTexturePath = './media/models/room/';
        const materialNames = [
            'Bathroom',
            'Bedroom',
            'Kitchen',
            'KitchenStuff',
            'LivingRoom',
            'MainParts',
            'Retro_Objects'
        ];


        await this.initializeSceneMaterials(materialNames, roomTexturePath, materialTypes)

        this._skyMaterial = new SkyMaterial();

        const path = './media/models/room/skybox/';
        const urls = [
            path + "px.jpg",    //x+
            path + "nx.jpg",    //x-
            path + "py.jpg",    //y+
            path + "ny.jpg",    //y-
            path + "pz.jpg",    //z+
            path + "nz.jpg",    //z-
        ]

        await this._skyMaterial.initialize(urls);

        const l1 = new PointLight(new Vector3(1, 1, 1), 3);
        l1.transform.position.set(-5.5, .4, -0.1);
        const l2 = new PointLight(new Vector3(1, 1, 1), 6);
        l2.transform.position.set(-3.1, 3.2, 0.5);
        this.cameraController.transform.position.set(0, 2, 0);
        this.cameraController.orbitRadius = 4
        this._initialized = true;


    }


    protected updateScene(): void {

    }

}