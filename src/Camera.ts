
import {mat4, type Mat4, vec3} from "wgpu-matrix";
import type {IObject} from "./IObject.ts";
import { Transform } from "./transform.ts";
import {Deg2Rad} from "./math-util.ts";

export class Camera implements IObject {

    name: string;
    transform: Transform;
    viewMatrix: Mat4;
    projectionMatrix: Mat4;
    fov: number = 90;

    constructor() {

        this.transform = new Transform();
        this.transform.setPosition(0, 0, -5);

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

    }



    update(){

        const target = vec3.add(this.transform.position, this.transform.forward);

        this.viewMatrix = mat4.lookAt(this.viewMatrix, target,  this.transform.up);

        this.projectionMatrix = mat4.perspective(Deg2Rad(this.fov/2), 600/600, 0.1, 1000);
    }
}