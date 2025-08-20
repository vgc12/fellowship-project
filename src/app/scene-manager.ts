import {type Scene} from "@/app/scene.ts";
import {SandBoxScene} from "@/app/sand-box-scene.ts";
import {RoomScene} from "@/app/room-scene.ts";
import {SpaceScene} from "@/app/space-scene.ts";
import {RobotScene} from "@/app/robot-scene.ts";


export class SceneManager {
    private readonly _scenes: Scene[];

    constructor() {
        this._scenes = [
            new SandBoxScene(),
            new RoomScene(),
            new SpaceScene(),
            new RobotScene(),
        ]


        this._currentScene = this._scenes[0];
    }

    private static _instance: SceneManager;

    static get instance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    get scenes() {
        return this._scenes;
    }

    private _currentScene: Scene;

    get currentScene() {
        return this._currentScene;
    }

    // Okay now this is really the best im going to get it
    async initializeAllScenes() {
        try {

            const initPromises: Promise<void>[] = [];

            for (const scene of this._scenes) {
                if (!scene.initialized) {
                    initPromises.push(scene.initialize());
                }
            }

            await Promise.all(initPromises);

            console.log('All scenes initialized');

        } catch (error) {
            console.error('Failed to initialize all scenes:', error);
        }
    }

    async switchToScene(sceneGUID: string, onLoadingChange?: (loading: boolean) => void) {
        try {
            onLoadingChange?.(true);
            this._scenes.forEach(scn =>
            {
                if (!(scn.guid == sceneGUID && scn.initialized)) {
                    return;
                }


                this._currentScene?.cleanup();
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


}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const $SCENE_MANAGER = SceneManager.instance;
