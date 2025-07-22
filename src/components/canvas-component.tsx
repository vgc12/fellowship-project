import {useEffect, useRef} from "react";
import {SandBoxScene } from "../app/scene.ts";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$INPUT} from "@/Controls/input.ts";
import {$TIME} from "@/utils/time.ts";
import {Material} from "@/graphics/3d/material.ts";

export function CanvasComponent() {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const initializeScene = async () => {
            // This runs AFTER the component has rendered
            if (canvasRef.current) {
                await $WGPU.initialize();
                $INPUT.initialize();
                $TIME.initialize();

                Material.default = new Material();
                Material.default.albedoFile = await Material.getFile('./img/default_albedo.png');
                Material.default.roughnessFile = await Material.getFile('./img/default_roughness.png');
                Material.default.metallicFile = await Material.getFile('./img/default_metallic.png');
                Material.default.normalFile = await Material.getFile('./img/default_normal.png');
                await Material.default.initialize();

                const app = new SandBoxScene();
                await app.initialize();
                await app.run();
            }
        };

        initializeScene();
    }, []);


    return (
        <div className={"mr-4 "}>
            <canvas className={""} ref={canvasRef} width={1200} height={600} id="canvas-main"/>
        </div>
    );
}