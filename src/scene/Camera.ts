
import {mat4, type Mat4} from "wgpu-matrix";
import type {IObject} from "./IObject.ts";
import { Transform } from "../core/math/transform.ts";
import { convertToRadians} from "../core/math/math-util.ts";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";
import {Vector3} from "@/core/math/vector3.ts";



export class Camera implements IObject {


    name: string;
    transform: Transform;
    viewMatrix: Mat4;
    projectionMatrix: Mat4;
    fov: number = 90;
    guid: string;
    target: Transform;


    constructor() {

        this.transform = new Transform();

        this.viewMatrix = mat4.create();

        this.projectionMatrix = mat4.create();

        this.guid= crypto.randomUUID();

        this.target = new Transform();

       // this.target.position  = Vector3.add(this.transform.position , new Vector3(this.transform.forward.x, this.transform.forward.y, this.transform.forward.z +5));
        this.target.position =  new Vector3(0, 0, 0);
        $WGPU.addObject(this);


    }



    update(){
        // update the view matrix to look at the target position
        // the view matrix holds the camera's position and orientation in the world
        // this is used to translate the world coordinates to camera coordinates
        const t = Vector3.add(this.transform.position, this.transform.forward.normalized);

        this.viewMatrix = mat4.lookAt(this.transform.position.toArray, t.toArray, this.transform.up.toArray);


       // this.viewMatrix = mat4.multiply(rotationMatrix, translationMatrix);
        // Update the projection matrix based on the camera's field of view and aspect ratio
        // the projection matrix is used to project the 3D coordinates into 2D screen coordinates
        // it is calculated based on the camera's field of view, aspect ratio, and near/far planes
        this.projectionMatrix = mat4.create();
        this.projectionMatrix = mat4.perspective(
            convertToRadians(this.fov/2),
            $WGPU.windowDimensions.width / $WGPU.windowDimensions.height,
            0.1,
            1000
        );
    }
}

