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

        this.rotation = new Vector3(0, 0, 0);
        this.rotation.onChange = this.onRotationChanged;
        this.scale = new Vector3(1, 1, 1);

        this._forward = new Vector3(0, 0, 1);
        this._right = new Vector3(1, 0, 0);
        this._up = new Vector3(0, 1, 0);

    }




private updateDirectionVectors() {
    const yaw = Deg2Rad(this.rotation.y);   // Y rotation - left/right
    const pitch = Deg2Rad(this.rotation.x); // X rotation - up/down
    const roll = Deg2Rad(this.rotation.z);  // Z rotation - tilt

    // Calculate forward vector (same as before)
    this._forward.set(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
    );

    // Calculate right vector using cross product with world up
    this._right.setFromArray(vec3.cross(this._forward.normalized.toArray, Vector3.WORLD_UP.toArray));


    // Calculate base up vector using cross product
    const baseUp = vec3.cross(this._right.normalized.toArray, this._forward.normalized.toArray);
    
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
    this._right.setFromArray(vec3.cross(this._forward.toArray, this._up.normalized.toArray));

}



    move(x: number = 0, y: number = 0, z: number = 0) {
        this.position.add(x, y, z);
    }

    rotate(x:number = 0, y:number = 0, z:number = 0) {
       this.rotation.add(x, y, z);
    }

    private onRotationChanged = ()=>{

        this.updateDirectionVectors();
    }
}