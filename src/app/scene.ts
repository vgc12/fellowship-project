import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";
import {$TIME} from "../utils/time.ts";
import {Material} from "@/graphics/3d/material.ts";
import {$INPUT} from "@/Controls/input.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {Renderer} from "@/core/renderer/renderer.ts";
import {PointLight} from "@/scene/point-light.ts";
import {SpotLight} from "@/scene/spot-light.ts";
import {Quaternion} from "@/core/math/quaternion.ts";


export class Scene {

    renderer: Renderer;

    constructor() {
        this.renderer = new Renderer();

    }

    pointLight: PointLight;
    spotLight: SpotLight;

    async initialize() {
        await $WGPU.initialize();
        $INPUT.initialize();

        Material.default = new Material();

        const albedoFile = await Material.getFile('./img/default_albedo.png');
        const roughnessFile = await Material.getFile('./img/default_roughness.png');
        const metallicFile = await Material.getFile('./img/default_metallic.png');
        const normalFile = await Material.getFile('./img/default_normal.png');

        Material.default.albedoFile = albedoFile
        Material.default.roughnessFile = roughnessFile;
        Material.default.metallicFile = metallicFile;
        Material.default.normalFile = normalFile;

        await Material.default.initialize();

        this.pointLight = new PointLight(new Vector3(1, 1, 1), 2);
        //this.spotLight = new SpotLight(new Vector3(1, 1, 1), 2, 4, 60);

        // this.spotLight.transform.position.set(0, 3, 4)

        //Quaternion.euler(30, 0, 0, this.spotLight.transform.rotation);


        await this.renderer.initialize();
        $TIME.initialize();


    }

    run = async () => {


        $WGPU.objects.forEach(o => {
            o.update()

        });

        this.renderer.update();

        requestAnimationFrame(this.run)


    };


}


