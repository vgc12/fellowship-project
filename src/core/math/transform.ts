import { vec3} from 'wgpu-matrix';
import {Deg2Rad} from "./math-util.ts";
import {Vector3} from "./vector3.ts";
import {Quaternion} from "@/core/math/quaternion.ts";



export class Transform {
    get eulerAngles(): Vector3 {
        if(this._eulerDirty){
            this._eulerAngles = this.rotation.getEulerAngles();
            this._eulerDirty = false;
        }
        return this._eulerAngles;
    }

    set eulerAngles(value: Vector3) {
        this._eulerAngles = value;
    }
    get rotation(): Quaternion {
        if(this._quaternionDirty){
            this._rotation.setFromEuler(
                this.eulerAngles.x,
                this.eulerAngles.y,
                this.eulerAngles.z);
            this._quaternionDirty = false;
        }
        return this._rotation;
    }

    set rotation(value: Quaternion) {
        this._rotation = value;
    }
    get up(): Vector3 {
        this.updateDirectionVectors()
        return this._up;
    }
    get right(): Vector3 {
        this.updateDirectionVectors()
        return this._right;
    }
    get forward(): Vector3 {
        this.updateDirectionVectors()
        return this._forward;
    }

    position: Vector3
    private _rotation: Quaternion
    private _eulerAngles: Vector3 = new Vector3(0, 0, 0);
    scale: Vector3

    private  _forward: Vector3;
    private  _right: Vector3;
    private  _up: Vector3;


    private _eulerDirty: boolean = false;
    private _quaternionDirty: boolean = false;



    constructor() {
        this.position = new Vector3(0,0,0);

        this.rotation = new Quaternion();
        this._rotation.onChange = this.onQuaternionChanged;
        this.eulerAngles.onChange = this.onEulersChanged;

        this.scale = new Vector3(1, 1, 1);

        this._forward = new Vector3(0, 0, 1);
        this._right = new Vector3(1, 0, 0);
        this._up = new Vector3(0, 1, 0);

    }




private updateDirectionVectors() {
    const yaw = Deg2Rad(this.eulerAngles.y);   // Y rotation - left/right
    const pitch = Deg2Rad(this.eulerAngles.x); // X rotation - up/down
    const roll = Deg2Rad(this.eulerAngles.z);  // Z rotation - tilt


    this._forward.set(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
    );


    // Calculate right vector using cross product with world up
    this._right.setFromArray(vec3.cross(this._forward.toArray, Vector3.WORLD_UP.toArray));


    // Calculate base up vector using cross product
    const baseUp = vec3.cross(this._right.toArray, this._forward.toArray);
    
    // Apply roll rotation to the up vector
    // Roll rotates around the forward axis
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);
    
    // Rotate the up vector around the forward axis by the roll amount
    const upRotated = vec3.create();
    upRotated[0] = this._right.x * sinRoll + baseUp[0] * cosRoll;
    upRotated[1] = this._right.y * sinRoll + baseUp[1] * cosRoll;
    upRotated[2] = this._right.z * sinRoll + baseUp[2] * cosRoll;
    
    this._up.set(upRotated[0], upRotated[1], upRotated[2]);

    // Recalculate right vector to ensure orthogonality after roll
    this._right.setFromArray(vec3.cross(this._forward.toArray, this._up.toArray));

}




    private onEulersChanged = ()=>{
        this._quaternionDirty = true;
        this._eulerDirty = false;
        this.updateDirectionVectors();
    }

    private onQuaternionChanged = () => {
        this._eulerDirty = true;
        this._quaternionDirty = false;
    }




}