
import {mat4, type Mat4, vec3} from "wgpu-matrix";
import type {IObject} from "./IObject.ts";
import { Transform } from "../core/math/transform.ts";
import {Deg2Rad} from "../core/math/math-util.ts";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";

export class Camera implements IObject {

    name: string;
    transform: Transform;
    viewMatrix: Mat4;
    projectionMatrix: Mat4;
    fov: number = 90;
    guid: string;

    constructor() {

        this.transform = new Transform();

        this.viewMatrix = mat4.create();

        this.projectionMatrix = mat4.create();

        this.guid= crypto.randomUUID();


        $WGPU.addObject(this);
    }

    move(forwards_amount: number, rights_amount: number){
        const vec = vec3.create();
        vec3.addScaled(
            this.transform.position.toArray, this.transform.forward.normalized.toArray,
            forwards_amount, vec
        );

        vec3.addScaled(
            this.transform.position.toArray, this.transform.right.normalized.toArray,
             rights_amount, vec
        );

        this.transform.position.set(vec[0], vec[1], vec[2]);

    }

    update(){

        this.viewMatrix = mat4.create();
        const target = vec3.add(this.transform.position.toArray, this.transform.forward.normalized.toArray);

        // update the view matrix to look at the target position
        // the view matrix holds the camera's position and orientation in the world
        // this is used to translate the world coordinates to camera coordinates
        this.viewMatrix = mat4.lookAt(this.transform.position.toArray, target,  this.transform.up.normalized.toArray);

        // Update the projection matrix based on the camera's field of view and aspect ratio
        // the projection matrix is used to project the 3D coordinates into 2D screen coordinates
        // it is calculated based on the camera's field of view, aspect ratio, and near/far planes
        this.projectionMatrix = mat4.create();
        this.projectionMatrix = mat4.perspective(
            Deg2Rad(this.fov/2),
            $WGPU.windowDimensions.width / $WGPU.windowDimensions.height,
            0.1,
            1000
        );
    }
}