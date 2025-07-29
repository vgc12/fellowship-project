import {Light, lightType} from "@/scene/point-light.ts";
import  {type Vector3} from "@/core/math/vector3.ts";
import {convertToRadians} from "@/core/math/math-util.ts";

export class SpotLight extends Light{
    get innerAngle(): number {
        return this._innerAngle;
    }

    set innerAngle(value: number) {
        this._innerAngleRadians = convertToRadians(value);
        this._innerAngle = value;
    }
    get outerAngle(): number {
        return this._outerAngle;
    }

    set outerAngle(value: number) {
        this._outerAngleRadians = convertToRadians(value);
        this._outerAngle = value;
    }

    get innerAngleRadians(): number {
        return this._innerAngleRadians;
    }
    get outerAngleRadians(): number {
        return this._outerAngleRadians;
    }



    private _innerAngle : number;
    private _outerAngle : number;
    private _innerAngleRadians : number;
    private _outerAngleRadians : number;

    constructor(color: Vector3, intensity: number, innerAngle: number, outerAngle: number) {
        super(color, intensity);
        this.name = 'Area Light';
        this.lightType = lightType.AREA;
        this._innerAngle = innerAngle;
        this._outerAngle = outerAngle;
        this._innerAngleRadians = convertToRadians(innerAngle);
        this._outerAngleRadians = convertToRadians(outerAngle);
    }
}