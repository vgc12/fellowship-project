import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {SceneObjectListComponent} from "../components/scene-object-list-component.tsx";
import {useSceneManager} from "@/components/use-scene-manager.tsx";
import {SceneNavigator} from "@/components/scene-navigator-component.tsx";
import {MainCanvas} from "@/components/main-canvas.tsx";
import {FileUploader} from "@/components/file-uploader.tsx";
import {LoadingDialog} from "@/components/loading-dialog.tsx";
import {useFileLoader} from "@/components/use-file-loader.tsx";
import {useAppInitialization} from "@/components/use-app-initialization.tsx";
import CameraControllerComponent from "@/components/camera-controller-component.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";


const App: React.FC = () => {
    const [shouldBeOpen, setShouldBeOpen] = useState(true);

    const {isLoading, setIsLoading, canvasRef} = useAppInitialization();
    const {handleFileLoad} = useFileLoader();
    const {currentScene, switchScene} = useSceneManager(setIsLoading);

    const handleSceneSwitch = async (id: string) => {
        await switchScene(id);
    };

    return (
        <div id="app" className="bg-gray-900">
            <LoadingDialog isOpen={shouldBeOpen} isLoading={isLoading}>
                <SceneNavigator
                    onClick={() => setShouldBeOpen(false)}
                    activeScene={currentScene}
                    isLoading={isLoading}
                    setActiveScene={handleSceneSwitch}
                />
            </LoadingDialog>

            <div className=" flex">
                <div className="text-center mt-12 justify-center">
                    {currentScene && (
                        <SceneNavigator
                            vertical={true}
                         
                            activeScene={currentScene}
                            isLoading={isLoading}
                            setActiveScene={handleSceneSwitch}
                        />
                    )}
                </div>

                <MainCanvas canvasRef={canvasRef}>
                    <h1 className={'text-4xl mb-4 font-normal text-white'}>{currentScene ? currentScene.name : ""}</h1>
                </MainCanvas>


                <div className="flex-1/3 mt-12 flex flex-col">
                    {$WGPU.cameraController && <CameraControllerComponent object={$WGPU.cameraController}/>}
                    {currentScene && (
                        <SceneObjectListComponent objects={currentScene.objects}/>
                    )}

                    {currentScene.name === 'Sandbox Scene' && <FileUploader onFileChange={handleFileLoad}/>}
                </div>
            </div>
        </div>
    );
};
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App/>
);
