import ReactDOM from 'react-dom/client';
import {SceneObjectListComponent} from "../components/scene-object-list-component.tsx";
import {type ChangeEvent, useState, useCallback, useEffect, useRef} from "react";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {useSceneManager} from "@/components/use-scene-manager.tsx";
import {SceneNavigator} from "@/components/scene-navigator-component.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$INPUT} from "@/Controls/input.ts";
import {$TIME} from "@/utils/time.ts";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";


function App() {

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


    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {

        const initializeAppCore = async () => {

            if (canvasRef.current) {
                await $WGPU.initialize();
                $INPUT.initialize();
                $TIME.initialize();
   

            }
        };

        initializeAppCore();
    }, []);

    const {
        currentScene,
        isLoading,
        switchScene
    } = useSceneManager()


    return (<div id='app' className={" bg-gray-900  "}>
        <div className={"m-4 flex p-4"}>

            <div className={"mr-4 "}>
                <canvas className={""} ref={canvasRef} width={1920} height={1080} id="canvas-main"/>
            </div>

            <div className={"flex-1/2 "}>

                {currentScene &&
                    <SceneObjectListComponent objects={currentScene.objects}></SceneObjectListComponent>}
                {currentScene &&
                    <SceneNavigator activeScene={currentScene} isLoading={isLoading}
                                    setActiveScene={async (id: string) => {
                                        await switchScene(id);
                                    }}></SceneNavigator>}
                <div className={"text-center p-4"}>
                    <label className={`
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
    <App/>
);
