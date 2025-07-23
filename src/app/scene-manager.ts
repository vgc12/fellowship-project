import {SandBoxScene, type Scene, SpaceScene, TVScene} from "@/app/scene.ts";


export class SceneManager {
    get scenes() {
        return this._scenes;
    }

    static get instance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    private static _instance: SceneManager;

    private _currentScene: Scene;


    private _scenes: Scene[];

    constructor() {
        this._scenes = [
            new SandBoxScene(),
            new TVScene(),
            new SpaceScene()
        ]

        this._currentScene = this._scenes[0];
    }

    async switchToScene(sceneGUID: string, onLoadingChange?: (loading: boolean) => void) {
        try {
            onLoadingChange?.(true);

            if (this._currentScene) {
                this._currentScene.cleanup();
            }

            this._scenes.forEach(scn => {
                if (scn.guid == sceneGUID) {
                    this._currentScene = scn;
                }
            });


            if (this._currentScene) {

                await this._currentScene.run();
            }


            onLoadingChange?.(false);
        } catch (error) {
            console.error('Failed to switch scene:', error);
            onLoadingChange?.(false);
        }
    }


    get currentScene() {
        return this._currentScene;
    }


}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const $SCENE_MANAGER = SceneManager.instance;
