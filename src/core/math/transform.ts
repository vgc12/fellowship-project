import {Vector3} from "./vector3.ts";
import {Quaternion} from "@/core/math/quaternion.ts";
import {vec3} from "wgpu-matrix";



export class Transform {
    get scale(): Vector3 {
        return this._scale;
    }

    set scale(value: Vector3) {
        this._scale = value;
    }
    get position(): Vector3 {
        return this._position;
    }


    set position(value: Vector3) {
        this._position = value;
    }

    get rotation(): Quaternion {

        return this._rotation;
    }

    set rotation(value: Quaternion) {

        this._rotation = value;
    }
    get up(): Vector3 {
        this.updateDirectionVectors()
        return this._up;
    }
    get right(): Vector3 {
        this.updateDirectionVectors()
        return this._right;
    }
    get forward(): Vector3 {
        this.updateDirectionVectors()
        return this._forward;
    }

    private _position: Vector3
    private _rotation: Quaternion

    private _scale: Vector3

    private readonly _forward: Vector3;
    private readonly _right: Vector3;
    private readonly _up: Vector3;






    constructor() {
        this._position = new Vector3(0,0,0);


        this.rotation = new Quaternion();
        this.rotation.addCallback( this.onRotationChanged);
        this._scale = new Vector3(1, 1, 1);

        this._forward = new Vector3(0, 0, 1);
        this._right = new Vector3(1, 0, 0);
        this._up = new Vector3(0, 1, 0);

    }




    private updateDirectionVectors () {


        const rm = this.rotation.rotationMatrix;

        this._forward.setFromArray(
            vec3.normalize([rm.r1c3,-rm.r2c3, rm.r3c3])
        )

        this._right.setFromArray(
            vec3.normalize([-rm.r1c1, rm.r2c1, -rm.r3c1])
        )

        this._up.setFromArray(
            vec3.normalize([-rm.r1c2, rm.r2c2, -rm.r3c2])
        )


    }

    private onRotationChanged = ()=>{

        this.updateDirectionVectors();
    }


}