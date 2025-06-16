
import {mat4, type Mat4, vec3} from "wgpu-matrix";
import type {IObject} from "./IObject.ts";
import { Transform } from "./transform.ts";
import {Deg2Rad} from "./math-util.ts";
import {$WGPU} from "./webgpu-singleton.ts";

export class Camera implements IObject {

    name: string;
    transform: Transform;
    viewMatrix: Mat4;
    projectionMatrix: Mat4;
    fov: number = 90;

    constructor() {

        this.transform = new Transform();

        this.viewMatrix = mat4.create();

        this.projectionMatrix = mat4.create();


        $WGPU.addObject(this);
    }



    update(){

        this.viewMatrix = mat4.create();
        const target = vec3.add(this.transform.position, this.transform.forward);

        // update the view matrix to look at the target position
        // the view matrix holds the camera's position and orientation in the world
        // this is used to translate the world coordinates to camera coordinates
        this.viewMatrix = mat4.lookAt(this.viewMatrix, target,  this.transform.up);

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