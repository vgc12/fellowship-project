import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {SceneObjectListComponent} from "../components/scene-object-list-component.tsx";
import {useSceneManager} from "@/components/use-scene-manager.tsx";
import {SceneNavigator} from "@/components/scene-navigator-component.tsx";
import {MainCanvas} from "@/components/main-canvas.tsx";
import {FileUploader} from "@/components/file-uploader.tsx";
import {LoadingDialog} from "@/components/loading-dialog.tsx";
import {useFileLoader} from "@/components/use-file-loader.tsx";
import {useAppInitialization} from "@/components/use-app-initialization.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {CameraController} from "@/components/camera-controller.tsx";
import {FaRegMoon, FaSun} from 'react-icons/fa';
import {UseCssClass} from "@/components/use-css-class.tsx";

const DarkModeToggle: React.FC<{ isDark: boolean; onToggle: () => void }> = ({isDark, onToggle}) =>
{
    const {buttonLightSquare} = UseCssClass();

    return (
        <button
            onClick={onToggle}
            className={buttonLightSquare + ' mt-auto'}
            aria-label="Toggle dark mode"
        >
            {isDark ? (

                <FaSun size={'3vh'}/>
            ) : (

                <FaRegMoon size={'3vh'}/>
            )}
        </button>
    );
};

const App: React.FC = () =>
{
    const [shouldBeOpen, setShouldBeOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() =>
    {

        return localStorage.getItem('darkMode') !== 'false';
    });

    useEffect(() =>
    {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const toggleDarkMode = () =>
    {
        setIsDarkMode(!isDarkMode);
    };

    const {isLoading, setIsLoading, canvasRef} = useAppInitialization();
    const {handleFileLoad} = useFileLoader();
    const {currentScene, switchScene} = useSceneManager(setIsLoading);

    const handleSceneSwitch = async (id: string) =>
    {
        await switchScene(id);
    };

    return (
        <div id="app" className={`dark:bg-gray-900 dark:text-white bg-gray-200  text-black`}>
            <div className="p-4">

                <LoadingDialog isOpen={shouldBeOpen} isLoading={isLoading}>
                    <SceneNavigator
                        onClick={() => setShouldBeOpen(false)}
                        activeScene={currentScene}
                        isLoading={isLoading}
                        setActiveScene={handleSceneSwitch}
                    />
                </LoadingDialog>

                <div className=" flex">
                    <div className="flex flex-col mt-12 ">

                        {currentScene && (
                            <SceneNavigator
                                vertical={true}

                                activeScene={currentScene}
                                isLoading={isLoading}
                                setActiveScene={handleSceneSwitch}
                            />
                        )}


                        <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode}></DarkModeToggle>

                    </div>

                    <MainCanvas canvasRef={canvasRef}>
                        <h1 className={'font-medium text-4xl mb-4  '}>{currentScene ? currentScene.name : ""}</h1>
                    </MainCanvas>


                    <div className="flex-1/3 mt-12 flex flex-col">
                        {$WGPU.cameraController && <CameraController/>}
                        {currentScene && (
                            <SceneObjectListComponent objects={currentScene.objects}/>
                        )}

                        {currentScene?.name === 'Sandbox Scene' && <FileUploader onFileChange={handleFileLoad}/>}
                    </div>
                </div>
            </div>
        </div>
    );
};
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App/>
);
