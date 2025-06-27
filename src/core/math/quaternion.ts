import  {Vector3} from "@/core/math/vector3.ts";
import {mat4, quat, vec3} from "wgpu-matrix";
import {convertToDegrees, convertToRadians} from "@/core/math/math-util.ts";


export class Quaternion{
    get w(): number {
        return this._w;
    }

    set w(value: number) {
        this._w = value;
        this.onChange?.(this._x, this._y, this._z, this._w)
    }
    get z(): number {
        return this._z;
    }

    set z(value: number) {
        this._z = value;
        this.onChange?.(this._x, this._y, this._z, this._w)
    }
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        this.onChange?.(this._x, this._y, this._z, this._w)
    }
    get x(): number {
        return this._x;
    }

    set x(value:  number) {
        this._x = value;
        this.onChange?.(this._x, this._y, this._z, this._w)
    }


    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    onChange?: (x: number, y: number, z: number, w: number) => void;






    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1, onChange?: (x: number, y: number, z: number, w: number) => void) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;

        this.onChange = onChange;



     //   this.calculateEulerAngles();

    }

    static lookRotation(forward: Vector3, up: Vector3 = Vector3.WORLD_UP) {
        forward = forward.normalized;

        let right = Vector3.cross(up, forward).normalized;
        if(right.sqrMagnitude < Number.EPSILON ){
            const fallBackUp = Math.abs(Vector3.dot(forward, Vector3.WORLD_UP)) < 0.999999 ? Vector3.WORLD_UP : Vector3.WORLD_RIGHT;
            right = Vector3.cross(fallBackUp, forward).normalized;
        }

        right = right.normalized;
        up = Vector3.cross(forward, right).normalized;

        const mat =mat4.create(
            right.x, up.x, forward.x, 0,
            right.y, up.y, forward.y, 0,
            right.z, up.z, forward.z, 0,
            0, 0, 0, 1
        );

        const q = quat.fromMat(mat);
        return new Quaternion(q[0], q[1], q[2], q[3]);
    }


    static fromToRotation(from : Vector3, to :Vector3) {
        // Normalize input vectors
        from = from.normalized;
        to = to.normalized;

        // Calculate dot product
        const dot = vec3.dot(from.toArray, to.toArray)

        // Handle special cases
        if (dot >= 0.999999) {  // Vectors are nearly identical
            return new Quaternion(0, 0, 0, 1)  // Identity quaternion
        }

        if (dot <= -0.999999) {
            // Find a perpendicular axis
            const axis = vec3.cross(from.toArray, [1, 0, 0])
            if (vec3.length(axis) < 0.000001) {
                vec3.cross(from.toArray, [0, 1, 0], axis)
            }
            vec3.normalize(axis,axis)
            return new Quaternion(axis[0], axis[1], axis[2], 0)  // 180° rotation
        }
        // General case
        const axis = vec3.cross(from.toArray, to.toArray)
        const s = Math.sqrt((1 + dot) * 2)
        const invs = 1 / s

        return new Quaternion(
            axis[0] * invs,
            axis[1] * invs,
            axis[2] * invs,
            s * 0.5
        )
    }


    //This is expecting x, y, z in degrees
     setFromEuler(x: number, y: number, z: number) {

        x = convertToRadians(x)
        y = convertToRadians(y) // Convert degrees to radians
        z = convertToRadians(z) // Convert degrees to radians

        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);

        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;

        this.onChange?.(this._x, this._y, this._z, this._w);
    }



    getEulerAngles(): Vector3 {
        const x =  convertToDegrees(Math.atan2(2 * (this._w * this._x + this._y * this._z), 1 - 2 * (this._x * this._x + this._y * this._y)));
        const y = convertToDegrees(Math.asin(2 * (this._w * this._y - this._z * this._x)));
        const z = convertToDegrees(Math.atan2(2 * (this._w * this._z + this._x * this._y), 1 - 2 * (this._y * this._y + this._z * this._z)));

        return new Vector3(x,y,z);
    }

}