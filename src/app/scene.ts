
import { Renderer } from '../core/renderer/renderer.ts';
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";

import {$TIME} from "../utils/time.ts";
import {Material} from "@/graphics/3d/material.ts";





export class Scene {

    renderer: Renderer;

    constructor() {
        this.renderer = new Renderer();


    }

    async initialize() {
        await $WGPU.initialize();

        Material.default = new Material();
        const response = await fetch('./img/default.png');
        const blob = await response.blob();
        const file = new File([blob], 'default.png');
        await Material.default.setImageFile(file)

        await this.renderer.initialize();
        $TIME.initialize();


    }

    run = () => {

        $WGPU.objects.forEach(o => {
            o.update()
        });

        this.renderer.update();

        requestAnimationFrame(this.run)
      


    };


}


