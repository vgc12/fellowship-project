
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
    target: Vector3;

    constructor() {

        this.transform = new Transform();

        this.viewMatrix = mat4.create();

        this.projectionMatrix = mat4.create();

        this.guid= crypto.randomUUID();

        this.target  = Vector3.add(this.transform.position , new Vector3(this.transform.forward.x, this.transform.forward.y, this.transform.forward.z +5));

        $WGPU.addObject(this);

        this.target = Vector3.ZERO;
        this.transform.position.onChange = this.positionChanged;
    }

    private positionChanged() {

    }


    rotate(){

       //const vec = vec3.rotateX(this.transform.position.toArray,this.target.toArray, $TIME.deltaTime);
       //vec3.rotateY(vec,this.target.toArray, $TIME.deltaTime, vec );
        const vec = vec3.rotateX(this.transform.position.toArray,this.target.toArray, .001);
       //const vec2 = vec3.rotateX(vec,vec3.fromValues(this.transform.forward.x, this.transform.forward.y, this.transform.forward.z +5), $TIME.deltaTime);
       //console.log(vec);
       const dir = vec3.subtract(this.target.toArray,vec)

        this.transform.position.set(vec[0], vec[1], vec[2]);

       const angleY = vec2.angle(vec2.create(this.transform.forward.x, this.transform.forward.z),vec2.create(dir[0],dir[2]) );

       //const angleX= vec2.angle(vec2.create(this.transform.forward.z, this.transform.forward.y),vec2.create(dir[2],dir[1]) );

      // console.log(angle * 180 / Math.PI);



        //this.transform.rotation.x = angleX * 180 / Math.PI;
        this.transform.rotation.y = angleY * 180 / Math.PI;
        console.log(this.transform.rotation);





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
        this.viewMatrix = mat4.lookAt(this.transform.position.toArray, this.target.toArray,  this.transform.up.normalized.toArray);



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

