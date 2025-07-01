
import {mat4, type Mat4, vec3} from "wgpu-matrix";
import type {IObject} from "./IObject.ts";
import { Transform } from "../core/math/transform.ts";
import { convertToRadians} from "../core/math/math-util.ts";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {$TIME} from "@/utils/time.ts";
import {Quaternion} from "@/core/math/quaternion.ts";


export class Camera implements IObject {


    name: string;
    transform: Transform;
    viewMatrix: Mat4;
    projectionMatrix: Mat4;
    fov: number = 90;
    guid: string;
    target: Transform;
    orbitRadius: number;
    x: number;
    y: number;


    constructor() {

        this.transform = new Transform();

        this.viewMatrix = mat4.create();

        this.projectionMatrix = mat4.create();

        this.guid= crypto.randomUUID();

        this.target = new Transform();

       // this.target.position  = Vector3.add(this.transform.position , new Vector3(this.transform.forward.x, this.transform.forward.y, this.transform.forward.z +5));
        this.target.position =  new Vector3(0, 0, 0);
        $WGPU.addObject(this);
        this.x = 0;    // Y-axis rotation (horizontal)
        this.y = 0;  // X-axis rotation (vertical)
        this.orbitRadius = 5; // Distance from the target

    }



    rotateAroundTarget(mouseX: number, mouseY: number){


         const sensitivity = 50;
         this.x +=  $TIME.deltaTime * mouseY * sensitivity;
         this.y +=  $TIME.deltaTime * mouseX * sensitivity;

         this.target.rotation = Quaternion.euler(this.x, this.y, 0);


        const pos = new Vector3(this.target.position.x-this.target.forward.x * this.orbitRadius,
            this.target.position.y-this.target.forward.y * this.orbitRadius,
            this.target.position.z-this.target.forward.z * this.orbitRadius)
        this.transform.position  = pos;

        this.transform.rotation = this.target.rotation;



    }


    rotate(mouseX: number, mouseY: number){
        const sensitivity = 10;

        this.transform.rotation.eulerAngles.x += mouseY * sensitivity * $TIME.deltaTime;
        this.transform.rotation.eulerAngles.y += mouseX * sensitivity * $TIME.deltaTime;

    }

    move(forwards_amount: number, right_amount: number){
        const vec = vec3.create();
        vec3.addScaled(
            this.transform.position.toArray, this.transform.forward.normalized.toArray,
            forwards_amount, vec
        );

        vec3.addScaled(
            this.transform.position.toArray, this.transform.right.normalized.toArray,
             right_amount, vec
        );

        this.transform.position.set(vec[0], vec[1], vec[2]);


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

