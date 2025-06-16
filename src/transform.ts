import { type Vec3, vec3} from 'wgpu-matrix';
import {Deg2Rad} from "./math-util.ts";

export class Transform {
    get up(): Float32Array<ArrayBufferLike> {
        return this._up;
    }
    get right(): Float32Array<ArrayBufferLike> {
        return this._right;
    }
    get forward(): Float32Array<ArrayBufferLike> {
        return this._forward;
    }
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;

    private _forward: Vec3;
    private _right: Vec3;
    private _up: Vec3;

    static readonly WORLD_UP: Vec3 = vec3.create(0, 1, 0);
    static readonly WORLD_RIGHT: Vec3 = vec3.create(1, 0, 0);
    static readonly WORLD_FORWARD: Vec3 = vec3.create(0, 0, 1);


    constructor() {
        this.position = vec3.create(0, 0, 0);
        this.rotation = vec3.create(0, 0, 0);
        this.scale = vec3.create(1, 1, 1);

        this._forward = vec3.create(0, 0, 1);
        this._right = vec3.create(1, 0, 0);
        this._up = vec3.create(0, 1, 0);
        this.updateDirectionVectors();
    }

    private updateDirectionVectors() {


        vec3.set(
            Math.sin(Deg2Rad(this.rotation[2])) * Math.cos(Deg2Rad(this.rotation[1])), //now x was y
            Math.sin(Deg2Rad(this.rotation[1])), //was z now y
            Math.cos(Deg2Rad(this.rotation[2])) * Math.cos(Deg2Rad(this.rotation[1])),this.forward


        );
        vec3.normalize(this._forward, this._forward);


        vec3.cross(this._forward, Transform.WORLD_UP, this._right);
        vec3.normalize(this._right, this._right);

        vec3.cross(this._right, this._forward, this._up);
        vec3.normalize(this._up, this._up);



    }

    setPosition(x: number = this.position[0], y: number = this.position[1], z: number = this.position[2]) {
        vec3.set(x, y, z, this.position);

    }

    setRotation(x: number = this.rotation[0], y: number = this.rotation[1], z: number = this.rotation[2]) {
        vec3.set(x, y, z, this.rotation);
        this.updateDirectionVectors()
    }

    setScale(x: number = this.scale[0], y: number = this.scale[1], z: number = this.scale[2]) {
        vec3.set(x, y, z, this.scale);

    }


    addRotation(x:number = 0, y:number = 0, z:number = 0) {
        vec3.add(vec3.create(x, y, z), this.rotation, this.rotation);
        this.updateDirectionVectors();
    }

}