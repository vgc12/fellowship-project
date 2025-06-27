
import {mat4, type Mat4, vec2, vec3} from "wgpu-matrix";
import type {IObject} from "./IObject.ts";
import { Transform } from "../core/math/transform.ts";
import {Deg2Rad} from "../core/math/math-util.ts";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {$TIME} from "@/utils/time.ts";


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

       // this.transform.position.onChange = this.positionChanged;
    }



    rotateAroundTarget(mouseX: number, mouseY: number){
        const sensitivity = 1;

        // Calculate the new position of the camera based on mouse movement

        const yVec = vec3.rotateY(this.transform.position.toArray ,this.target.position.toArray, mouseX * $TIME.deltaTime * sensitivity )

        this.transform.position.set(yVec[0], yVec[1], yVec[2]);

        const dir = Vector3.subtract(this.target.position, this.transform.position);



        const angle = vec3.angle( this.transform.forward.normalized.toArray,dir.toArray);


        //this.transform.position = Vector3.add(this.target.position, rotatedOffset);
    }


    rotate(mouseX: number, mouseY: number){
        const sensitivity = 10;

        this.transform.eulerAngles.y += mouseX * sensitivity * $TIME.deltaTime;
        this.transform.eulerAngles.x += mouseY * sensitivity * $TIME.deltaTime;


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
        // update the view matrix to look at the target position
        // the view matrix holds the camera's position and orientation in the world
        // this is used to translate the world coordinates to camera coordinates
        //console.log(vec3.angle(this.transform.position.toArray, this.target.toArray) * 180 / Math.PI);
        //this.viewMatrix = mat4.lookAt(this.transform.position.toArray, this.target.toArray, this.transform.up.toArray);

        const t = Vector3.add(this.transform.position, this.transform.forward);
        this.viewMatrix = mat4.lookAt(this.transform.position.toArray, t.toArray, this.transform.up.toArray);


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

