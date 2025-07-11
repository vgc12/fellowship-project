
import { Renderer } from '../core/renderer/renderer.ts';
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";

import {$TIME} from "../utils/time.ts";
import {Material} from "@/graphics/3d/material.ts";
import {$INPUT} from "@/Controls/input.ts";

import {PointLight} from "@/scene/point-light.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {AreaLight} from "@/scene/area-light.ts";






export class Scene {

    renderer: Renderer;

    constructor() {
        this.renderer = new Renderer();
    }

    async initialize() {
        await $WGPU.initialize();
        $INPUT.initialize();

        Material.default = new Material();

        const albedoFile = await Material.GetFile('./img/default_albedo.png');
        const roughnessFile = await Material.GetFile('./img/default_roughness.png');
        const metallicFile = await Material.GetFile('./img/default_metallic.png');
        const aoFile = await Material.GetFile('./img/default_ao.png');

        Material.default.albedoFile = albedoFile
        Material.default.roughnessFile = roughnessFile;
        Material.default.metallicFile = metallicFile;
        Material.default.aoFile = aoFile;

        await Material.default.initialize();
        new PointLight(new Vector3(1,0,0), 2000);
        new PointLight(new Vector3(1,1,0), 2000);

        new AreaLight(new Vector3(0, 1, 0), 10000, 10, 10);

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


