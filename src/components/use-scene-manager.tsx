import { Scene} from "@/app/scene";
import {useCallback, useState } from "react";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";

const sceneManager = $SCENE_MANAGER;


// eslint-disable-next-line @typescript-eslint/naming-convention
export const useSceneManager = () => {
    const [currentScene, setCurrentScene] = useState<string >('SandBoxScene');
    const [isLoading, setIsLoading] = useState(false);

    const switchScene = useCallback(async (scene: string) => {

        await sceneManager.switchToScene(scene, setIsLoading);
        setCurrentScene(scene);

    }, []);

    return {
        currentScene,
        isLoading,
        switchScene
    };
};