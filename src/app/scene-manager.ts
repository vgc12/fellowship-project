import {type Scene} from "@/app/scene.ts";
import {SandBoxScene} from "@/app/sand-box-scene.ts";
import {BathroomScene} from "@/app/bathroom-scene.ts";
import {SpaceScene} from "@/app/space-scene.ts";



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


    private readonly _scenes: Scene[];

    constructor() {
        this._scenes = [
            new SandBoxScene(),
            new BathroomScene(),
            new SpaceScene()
        ]


        this._currentScene = this._scenes[0];
    }


    async initializeAllScenes() {
        try {
            for (const scene of this._scenes) {
                if (!scene.initialized) {
                    this._currentScene = scene;
                    await scene.initialize();
                }
            }
            console.log('All scenes initialized');
            this._currentScene = this._scenes[0];
        } catch (error) {
            console.error('Failed to initialize all scenes:', error);
        }
    }

    async switchToScene(sceneGUID: string, onLoadingChange?: (loading: boolean) => void) {
        try {
            onLoadingChange?.(true);
            this._scenes.forEach(scn => {
                if (!(scn.guid == sceneGUID && scn.initialized)) {
                    return;
                }

                this._currentScene.cleanup();
                this._currentScene = scn;

            });


            if (this._currentScene) {
                await this._currentScene.start();
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
