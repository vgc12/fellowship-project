import {Light, lightType} from "@/scene/point-light.ts";
import {type Vector3} from "@/core/math/vector3.ts";
import {convertToRadians} from "@/core/math/math-util.ts";

export class SpotLight extends Light {
    constructor(color: Vector3, intensity: number, innerAngle: number, outerAngle: number) {
        super(color, intensity);
        this.name = 'Spot Light';
        this.lightType = lightType.SPOT;
        this._innerAngle = innerAngle;
        this._outerAngle = outerAngle;
        this._innerAngleRadians = convertToRadians(innerAngle);
        this._outerAngleRadians = convertToRadians(outerAngle);
    }

    private _innerAngle: number;

    get innerAngle(): number {
        return this._innerAngle;
    }

    set innerAngle(value: number) {
        this._innerAngleRadians = convertToRadians(value);
        this._innerAngle = value;
    }

    private _outerAngle: number;

    get outerAngle(): number {
        return this._outerAngle;
    }

    set outerAngle(value: number) {
        this._outerAngleRadians = convertToRadians(value);
        this._outerAngle = value;
    }

    private _innerAngleRadians: number;

    get innerAngleRadians(): number {
        return this._innerAngleRadians;
    }

    private _outerAngleRadians: number;

    get outerAngleRadians(): number {
        return this._outerAngleRadians;
    }
}