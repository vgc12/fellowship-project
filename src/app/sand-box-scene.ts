import {PointLight} from "@/scene/point-light.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {Scene} from "@/app/scene.ts";

export class SandBoxScene extends Scene {
    cleanup(): void {

    }

    constructor() {
        super();
        this.name = 'Sandbox Scene';

    }


    async initialize(): Promise<void> {
        await super.initialize();


        const l1 = new PointLight(new Vector3(1, 1, 1), 50);

        this.addLight(l1);

        this._initialized = true;
    }

    protected updateScene(): void {

    }

}