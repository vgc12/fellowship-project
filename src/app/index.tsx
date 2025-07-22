import ReactDOM from 'react-dom/client';
import {SceneObjectListComponent} from "../components/scene-object-list-component.tsx";
import {type ChangeEvent, useState, useCallback, useEffect, useRef} from "react";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {CanvasComponent} from "@/components/canvas-component.tsx";

import {useSceneManager} from "@/components/use-scene-manager.tsx";
import type {IObject} from "@/scene/IObject.ts";
import {SceneNavigator} from "@/components/scene-navigator-component.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$INPUT} from "@/Controls/input.ts";
import {$TIME} from "@/utils/time.ts";
import {Material} from "@/graphics/3d/material.ts";
import {SandBoxScene} from "@/app/scene.ts";


function App () {


    const [loadedFiles, setLoadedFiles] = useState<File[]>([]);
    const handleOnChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            for (const file of e.target.files) {
                if (loadedFiles.includes(file)) continue;

                if (file.name.endsWith('.obj')) {
                    await OBJLoader.loadMeshes(file);
                   setLoadedFiles([...loadedFiles, file]);
                }

            }
        }
    }, [loadedFiles]);

    const {
        currentScene,
        isLoading,

        switchScene,

    } = useSceneManager();


    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const initializeScene = async () => {

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
            }
        };

        initializeScene();
    }, []);

    return (<div id='app' className={" bg-gray-900  "}>
        <div className={"m-4 flex p-4"}>

            <div className={"mr-4 "}>
                <canvas className={""} ref={canvasRef} width={1200} height={600} id="canvas-main"/>
            </div>

        <div className={"flex-1/2 "}>


            <SceneObjectListComponent objects={currentScene?.objects as IObject[]}></SceneObjectListComponent>
            <SceneNavigator activeScene={'SandBoxScene'} isLoading={false} setActiveScene={(id: string) => {
               switchScene(id);
                } }></SceneNavigator>
            <div className={"text-center p-4"}>
                <label   className={`
                    text-white bg-gray-700 hover:bg-gray-500 focus:outline-none 
                    focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm 
                    px-5 py-2.5 dark:bg-gray-800 dark:hover:bg-gray-700 
                    dark:focus:ring-gray-700 dark:border-gray-700 m-4
                `} htmlFor="file-input">Load Model</label>
                <input  
                style={{display: "none"}}
                type="file"
                id="file-input"
                multiple
                onChange={(e) => handleOnChange(e)}
            />
            </div>
        </div>
        </div>
    </div>);
}
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App />
);
