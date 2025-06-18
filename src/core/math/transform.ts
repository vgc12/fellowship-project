import {vec3} from 'wgpu-matrix';
import {Deg2Rad} from "./math-util.ts";
import {Vector3} from "./vector3.ts";


export class Transform {
    get up(): Vector3 {
        return this._up;
    }
    get right(): Vector3 {
        return this._right;
    }
    get forward(): Vector3 {
        return this._forward;
    }

    position: Vector3
    rotation: Vector3
    scale: Vector3

    private  _forward: Vector3;
    private  _right: Vector3;
    private  _up: Vector3;




    constructor() {
        this.position = new Vector3(0,0,0);

        this.rotation = new Vector3(0, 0, 0, this.updateDirectionVectors);

        this.scale = new Vector3(1, 1, 1);

        this._forward = new Vector3(0, 0, 1);
        this._right = new Vector3(1, 0, 0);
        this._up = new Vector3(0, 1, 0);

    }

    private updateDirectionVectors = () => {


        this._forward.set(
            Math.sin(Deg2Rad(this.rotation.z)) * Math.cos(Deg2Rad(this.rotation.y)),
            Math.sin(Deg2Rad(this.rotation.y)), 
            Math.cos(Deg2Rad(this.rotation.z)) * Math.cos(Deg2Rad(this.rotation.y))
        )



        this._right.setFromArray(vec3.cross(this._forward.toArray, Vector3.WORLD_UP.toArray));


        this._up.setFromArray(vec3.cross(this._right.toArray, this._forward.toArray));


    }

    setPosition(x: number = this.position.x, y: number = this.position.y, z: number = this.position.z) {
        this.position.set(x, y, z);

    }



    setRotation(x: number = this.rotation.x, y: number = this.rotation.y, z: number = this.rotation.z) {
        this.rotation.set(x, y, z);
        this.updateDirectionVectors()
    }

    setScale(x: number = this.scale.x, y: number = this.scale.y, z: number = this.scale.z) {
        this.scale.set(x, y, z);

    }

    addScale(x: number = 0, y: number = 0, z: number = 0) {

        this.scale.x += x;
        this.scale.y += y;
        this.scale.z += z;
    }

    move(x: number = 0, y: number = 0, z: number = 0) {
        this.position.add(x, y, z);
    }

    rotate(x:number = 0, y:number = 0, z:number = 0) {
       this.rotation.add(x, y, z);
    }

}