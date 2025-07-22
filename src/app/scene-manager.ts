import {SandBoxScene, type Scene, SpaceScene, TVScene} from "@/app/scene.ts";




export class SceneManager {
    get scenes(): { [key: string]: Scene } {
        return this._scenes;
    }

    static get instance(): SceneManager {
        if(!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    private static _instance = new SceneManager();

    private _currentScene: Scene;



    private _scenes: { [key: string]: Scene };

    constructor() {
        this._scenes = {
            'SandBoxScene': new SandBoxScene(),
            'SpaceScene': new SpaceScene(),
            'TVScene': new TVScene()
        };

        this._currentScene = this._scenes['SandBoxScene'];
    }

    async switchToScene(scene: string, onLoadingChange?: (loading: boolean) => void) {
        try {
            onLoadingChange?.(true);

            if (this._currentScene) {
                this._currentScene.cleanup();
            }

            this._currentScene = this._scenes[scene];


            if(this._currentScene) {
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
