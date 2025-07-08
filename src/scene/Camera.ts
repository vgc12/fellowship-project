
import {mat4, type Mat4} from "wgpu-matrix";
import type {IObject} from "./IObject.ts";
import { Transform } from "../core/math/transform.ts";
import { convertToRadians} from "../core/math/math-util.ts";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";
import {Vector3} from "@/core/math/vector3.ts";


export class Camera implements IObject {
    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
    get transform(): Transform {
        return this._transform;
    }
    get viewMatrix(): Mat4 {
        return this._viewMatrix;
    }
    get projectionMatrix(): Mat4 {
        return this._projectionMatrix;
    }
    get fov(): number {
        return this._fov;
    }
    get guid(): string {
        return this._guid;
    }


    private _name: string;
    private readonly _transform: Transform;
    private _viewMatrix: Mat4;
    private _projectionMatrix: Mat4;
    private _fov: number = 90;
    private readonly _guid: string;



    constructor() {

        this._transform = new Transform();

        this._viewMatrix = mat4.create();

        this._projectionMatrix = mat4.create();

        this._guid= crypto.randomUUID();

        $WGPU.addObject(this);


    }



    update(){
        // update the view matrix to look at the target position
        // the view matrix holds the camera's position and orientation in the world
        // this is used to translate the world coordinates to camera coordinates
        const t = Vector3.add(this._transform.position, this._transform.forward.normalized);

        this._viewMatrix = mat4.lookAt(this._transform.position.toArray, t.toArray, this._transform.up.toArray);


       // this.viewMatrix = mat4.multiply(rotationMatrix, translationMatrix);
        // Update the projection matrix based on the camera's field of view and aspect ratio
        // the projection matrix is used to project the 3D coordinates into 2D screen coordinates
        // it is calculated based on the camera's field of view, aspect ratio, and near/far planes
        this._projectionMatrix = mat4.create();
        this._projectionMatrix = mat4.perspective(
            convertToRadians(this._fov/2),
            $WGPU.windowDimensions.width / $WGPU.windowDimensions.height,
            0.1,
            1000
        );
    }
}

