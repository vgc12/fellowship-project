import {Light, lightType} from "@/scene/point-light.ts";
import type {Vector3} from "@/core/math/vector3.ts";

export class AreaLight extends Light{
    width : number;
    height : number;
    constructor(color: Vector3, intensity: number, width: number, height: number) {
        super(color, intensity);
        this.name = 'Area Light';
        this.lightType = lightType.AREA;
        this.width = width;
        this.height = height;
    }
}