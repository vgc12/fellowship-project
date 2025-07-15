import  {type Vector3} from "@/core/math/vector3.ts";
import type {IObject} from "@/scene/IObject.ts";
import {Transform} from "@/core/math/transform.ts";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";


export const lightType = {
    POINT: 0,
    AREA: 1
} as const;

export type LightType = typeof lightType[keyof typeof lightType];

export class Light implements IObject{
    get color(): Vector3 {
        return this._color;
    }

    set color(value: Vector3) {
        this._color = value;
    }

    private _color: Vector3;
    intensity: number;

    constructor(color: Vector3, intensity: number) {

        this._color = color;
        this.intensity = intensity;
        this.guid = crypto.randomUUID();
        this.name = 'Point Light';
        this.transform = new Transform();
        $WGPU.addLight(this);
        $WGPU.addObject(this);
    }

    update() {

    }

    guid: string;
    name: string;
    transform: Transform;
    lightType : LightType
}


export class PointLight extends Light {
    constructor(color: Vector3, intensity: number) {
        super(color, intensity);
        this.name = 'Point Light';
        this.lightType = lightType.POINT;
    }

}