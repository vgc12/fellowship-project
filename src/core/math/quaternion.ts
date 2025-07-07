import  {Vector3} from "@/core/math/vector3.ts";
import {mat3} from "wgpu-matrix";
import { convertToDegrees, convertToRadians} from "@/core/math/math-util.ts";



export class Quaternion{

    get toArray(): [number, number, number, number]{
        if(this._setArray) {
            this._toArray = [this._x, this._y, this._z, this._w];
            this._setArray = false;
        }

        return this._toArray;
    }


    get w(): number {
        return this._w;
    }

    set w(value: number) {
        this._w = value;
        this.flagRecalculations();
        this.onChange.forEach(c => c?.(this._x, this._y, this._z, this._w));
    }
    get z(): number {
        return this._z;
    }

    set z(value: number) {
        this._z = value;
        this.flagRecalculations();
        this.onChange.forEach(c => c?.(this._x, this._y, this._z, this._w));
    }
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        this.flagRecalculations();
        this.onChange.forEach(c => c?.(this._x, this._y, this._z, this._w));
    }
    get x(): number {
        return this._x;

    }

    set x(value:  number) {
        this._x = value;
        this.flagRecalculations();
        this.onChange.forEach(c => c?.(this._x, this._y, this._z, this._w));
    }


    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    private _normalized: Quaternion;
    private _eulerAngles: Vector3;
    private _length: number;
    private _toArray: [number, number, number, number];

    // Lazy recalculation flags, calculate only when needed
    private _recalculateNormalization: boolean = true;
    private _recalculateEulerAngles: boolean = true;
    private _recalculateLength: boolean = true;
    private _recalculateRotationMatrix: boolean = true;
    private _setArray: boolean = true;

    private _rotationMatrix: {[coordinate : string] : number};

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1, onChange?: (x: number, y: number, z: number, w: number) => void) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this._eulerAngles = new Vector3(0, 0, 0);
        this._eulerAngles.addCallback((x: number, y: number, z: number) => {

               this.setFromEuler(x, y, z);
            this.flagRecalculations()
        });
        this.onChange = new Array<(x: number, y: number, z: number, w: number) => void>();


        if(onChange) {
            this.onChange.push(onChange)
        }

        this.flagRecalculations();
        this.onChange.forEach(c => c?.(this._x, this._y, this._z, this._w));


    }

    addCallback =  (onChange: (x: number, y: number, z: number, w: number) => void)=> {
        this.onChange.push(onChange);
    }

    private flagRecalculations() {
        this._recalculateNormalization = true;
        this._recalculateEulerAngles = true;
        this._recalculateLength = true;
        this._recalculateRotationMatrix = true;
        this._setArray = true;

    }

    get eulerAngles() {
        if( this._recalculateEulerAngles) {
            this.calculateEulerAngles();
            this._recalculateEulerAngles = false;
        }

        return this._eulerAngles;

    }

    get length(): number {

        if(this._recalculateLength) {
            this.calculateLength();
            this._recalculateLength = false;
        }
        return this._length;

    }

    get normalized(): Quaternion {
        if(!this._normalized) {
            this._normalized = new Quaternion(this._x, this._y, this._z, this._w);
        }

        if(this._recalculateNormalization) {
            this.calculateNormalization()
        }
        return this._normalized;
    }

    /*
     * A 3x3 rotation matrix representing the quaternion.
     * This is accessed by rows and columns, rotationMatrix.r1c1 for the first row and first column.
     * The first row represents the transformed X axis, the second row represents the transformed Y axis,
     * and the third row represents the transformed Z axis.
     */
    get rotationMatrix(): {[coordinate : string] : number} {
        if(this._recalculateRotationMatrix) {
            this.calculateRotationMatrix()

            this._recalculateRotationMatrix = false;
        }

        return this._rotationMatrix;
    }

    private calculateRotationMatrix() {

        // Create rotation matrix from quaternion
        // https://automaticaddison.com/wp-content/uploads/2020/09/quaternion-to-rotation-matrix.jpg

        // Convert quaternion to rotation matrix
        // The code of how it is calculated can be found here:
        // https://github.com/greggman/wgpu-matrix/blob/main/src/mat3-impl.ts
        const mat = mat3.fromQuat(this.normalized.toArray);

        this._rotationMatrix = {
            r1c1: mat[0], r1c2: mat[1], r1c3: mat[2],
            r2c1: mat[4], r2c2: mat[5], r2c3: mat[6],
            r3c1: mat[8], r3c2: mat[9], r3c3: mat[10]
        };


    }

    private calculateLength() {
        this._length = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }

    private calculateNormalization() {

        this._normalized.set(
            this._x / this.length,
            this._y / this.length,
            this._z / this.length,
            this._w / this.length
        );

    }

    private calculateEulerAngles() {


        let yaw: number;
        let roll: number;


        // Check for gimbal lock
        const sinPitch = -this.rotationMatrix.r2c3;

        const pitch = Math.asin(Math.max(-1, Math.min(1, sinPitch)));

        const isGimbalLock = Math.abs(pitch) >= (Math.PI / 2 - 0.00001);


        if (isGimbalLock) {

            yaw = Math.atan2(-this.rotationMatrix.r3c1, this.rotationMatrix.r1c1);
            roll = 0; // Set roll to 0 in gimbal lock
        } else {

            yaw = Math.atan2(this.rotationMatrix.r1c3, this.rotationMatrix.r3c3);
            roll = Math.atan2(this.rotationMatrix.r2c1, this.rotationMatrix.r2c2);
        }


        this._eulerAngles = new Vector3 (convertToDegrees(pitch), convertToDegrees(yaw), convertToDegrees(roll));


    }



    onChange: Array < (x: number, y: number, z: number, w: number) => void>;

    set(x: number, y: number, z: number, w: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this.flagRecalculations();
        this.onChange.forEach(c => c?.(this._x, this._y, this._z, this._w));
    }


    //This is expecting x, y, z in degrees
    setFromEuler(x: number, y: number, z: number) {

        Quaternion.euler(x, y, z, this);

        this.flagRecalculations();
        this.onChange.forEach(c => c?.(this._x, this._y, this._z, this._w));
    }

    static euler(x: number, y: number, z: number, out? : Quaternion): Quaternion {
        x = convertToRadians(x)
        y = convertToRadians(y)
        z = convertToRadians(z)



        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);


        if(!out) {
            out = new Quaternion();
        }



        out.x = s1 * c2 * c3 + c1 * s2 * s3;
        out.y = c1 * s2 * c3 - s1 * c2 * s3;
        out.z = c1 * c2 * s3 + s1 * s2 * c3;
        out.w = c1 * c2 * c3 - s1 * s2 * s3;


        return out;
    }

    private static _identity: Quaternion = new Quaternion(0, 0, 0, 1);

    static get identity() {
        return this._identity
    }

    static multiply(yRotation: Quaternion, orbitRotation: Quaternion) {

        const x = yRotation.x * orbitRotation.w + yRotation.w * orbitRotation.x + yRotation.y * orbitRotation.z - yRotation.z * orbitRotation.y;
        const y = yRotation.y * orbitRotation.w + yRotation.w * orbitRotation.y + yRotation.z * orbitRotation.x - yRotation.x * orbitRotation.z;
        const z = yRotation.z * orbitRotation.w + yRotation.w * orbitRotation.z + yRotation.x * orbitRotation.y - yRotation.y * orbitRotation.x;
        const w = yRotation.w * orbitRotation.w - yRotation.x * orbitRotation.x - yRotation.y * orbitRotation.y - yRotation.z * orbitRotation.z;

        return new Quaternion(x, y, z, w);
    }

    static angleAxis(up : Vector3, angle : number, angleInRadians = false): Quaternion {

        const halfAngle = angleInRadians ? angle * .5 :  convertToRadians(angle) * .5;
        const sinHalfAngle = Math.sin(halfAngle);
        const cosHalfAngle = Math.cos(halfAngle);

        return new Quaternion(
            up.x * sinHalfAngle,
            up.y * sinHalfAngle,
            up.z * sinHalfAngle,
            cosHalfAngle
        );

    }


    static multiplyVector3(q: Quaternion, vec: Vector3) {
        const x = vec.x, y = vec.y, z = vec.z;
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

        const ix =  qw * x + qy * z - qz * y,
            iy =  qw * y + qz * x - qx * z,
            iz =  qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        return new Vector3(ix * qw + iw * -qx + iy * -qz - iz * -qy,iy * qw + iw * -qy + iz * -qx - ix * -qz,iz * qw + iw * -qz + ix * -qy - iy * -qx);
    }
}