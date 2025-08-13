import type {Scene} from "@/app/scene.ts";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";

interface SceneNavigatorProps {
    activeScene: Scene;
    isLoading: boolean;
    setActiveScene: (id: string) => void;
}


export const SceneNavigator = (props: SceneNavigatorProps) => {

    return (
        <>
            {
                $SCENE_MANAGER.scenes.map((scn) => {
                    return (<SceneButtonComponent key={scn.guid} sceneName={scn.name} sceneGUID={scn.guid}
                                                  activeSceneName={props.activeScene.name}
                                                  setActiveScene={props.setActiveScene}></SceneButtonComponent>)
                })
            }

        </>
    );
};

type SceneButtonComponentProps = {
    sceneName: string;
    sceneGUID: string;
    activeSceneName: string;
    setActiveScene: (id: string) => void;
}

const SceneButtonComponent = (props: SceneButtonComponentProps) => {
    const {sceneName, activeSceneName, sceneGUID, setActiveScene} = props;

    return (
        <button
            key={sceneName}
            onClick={() => setActiveScene(sceneGUID)}
            className={`p-3 rounded-lg transition-all duration-200 ${
                activeSceneName === sceneName
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title={sceneName}
        >

        </button>
    )
}