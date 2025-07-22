import type {Scene} from "@/app/scene.ts";
import {lightType} from "@/scene/point-light.ts";

interface SceneNavigatorProps {
    activeScene: SceneTypes;
    isLoading: boolean;
    setActiveScene: (id: string) => void;
}



export const SceneNavigator = (props: SceneNavigatorProps) =>
{

    return (
        <>
            <SceneButtonComponent sceneName={Scenes.SandBox} activeScene={props.activeScene}
                                  setActiveScene={props.setActiveScene}></SceneButtonComponent>
        </>
    );
};

type SceneButtonComponentProps = {
    sceneName: SceneTypes;
    activeScene: SceneTypes;
    setActiveScene: (id: string) => void;
}

const SceneButtonComponent = (props: SceneButtonComponentProps) =>
{
    const {sceneName, activeScene, setActiveScene} = props;

    return (
        <button
            key={sceneName}
            onClick={() => setActiveScene(sceneName)}
            className={`p-3 rounded-lg transition-all duration-200 ${
                activeScene === sceneName
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title={sceneName}
        >

        </button>
    )
}