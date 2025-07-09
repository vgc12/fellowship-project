
import { Renderer } from '../core/renderer/renderer.ts';
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";

import {$TIME} from "../utils/time.ts";
import {Material} from "@/graphics/3d/material.ts";
import {$INPUT} from "@/Controls/input.ts";
import { CameraController } from '@/Controls/camera-controller.ts';






export class Scene {

    renderer: Renderer;
    cameraController : CameraController

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
        Material.default.ambientOcclusionFile = aoFile;

        await Material.default.initialize();

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


