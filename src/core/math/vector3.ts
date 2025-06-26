// I decided to write my own vector 3 as a response to it just working better with react
// Also im changing things to make it feel better to program with compared to the wgpu-matrix library
export class Vector3 {
    set onChange(onChange: (x: number, y: number, z: number) => void){
        this._onChange = onChange;
    }


    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private _onChange?: (x: number, y: number, z: number) => void;
    private _toArray: [number, number, number] = [this._x, this._y, this._z];
    private _normalized: Vector3;
    private _magnitude: number;

    // calculating normals and magnitude can get expensive. Caching these properties.
    private _recalculateNormalization: boolean = true;
    private _recalculateMagnitude: boolean = true;

    static readonly WORLD_UP: Vector3 = new Vector3(0, 1, 0);
    static readonly WORLD_RIGHT: Vector3 = new Vector3(1, 0, 0);
    static readonly WORLD_FORWARD: Vector3 = new Vector3(0, 0, 1);

    constructor(x: number = 0, y: number = 0, z: number = 0, onChange?: (x: number, y: number, z: number) => void) {
        this._x = x;
        this._y = y;
        this._z = z;



        this.flagRecalculations();
        this._onChange = onChange;
    }

    private updateArray() {
        this._toArray[0] = this._x;
        this._toArray[1] = this._y;
        this._toArray[2] = this._z;
    }


    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        this.flagRecalculations()
        this._onChange?.(this._x, this._y, this._z);
    }


    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        this.flagRecalculations()
        this._onChange?.(this._x, this._y, this._z);
    }


    get z(): number {
        return this._z;
    }

    set z(value: number) {
        this._z = value;
        this.flagRecalculations()
        this._onChange?.(this._x, this._y, this._z);
    }


    set(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this.flagRecalculations()
        this._onChange?.(this._x, this._y, this._z);
    }

    setFromArray(array: [number, number, number]) {
        this._x = array[0];
        this._y = array[1];
        this._z = array[2];
        this.flagRecalculations()
        this._onChange?.(this._x, this._y, this._z);
    }


    get toArray(): [number, number, number] {
        this.updateArray();
        return this._toArray;
    }


    add(x: number, y: number, z: number) {
        this._x += x;
        this._y += y;
        this._z += z;
        this.flagRecalculations()
        this._onChange?.(this._x, this._y, this._z);
    }

    static add(a: Vector3, b: Vector3, out?: Vector3) {
        if (!out) {

            out = new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
        }
        else {
            out.set(a.x + b.x, a.y + b.y, a.z + b.z);
        }

        return out;
    }

    get magnitude(): number {
        if (this._recalculateMagnitude) {
            this._magnitude = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);

            this._recalculateMagnitude = false;
        }
        return this._magnitude;
    }

    get normalized(): Vector3 {
        if(!this._normalized) {
            this._normalized = new Vector3(this._x, this._y, this._z);
        }

        if (this._recalculateNormalization) {
            this._normalized.set(this._x / this.magnitude,
                this._y / this.magnitude,
                this._z / this.magnitude);
            this._recalculateNormalization = false;
        }
        return this._normalized;
    }

    private flagRecalculations() {
        this._recalculateNormalization = true;
        this._recalculateMagnitude = true;
    }

    static readonly ZERO: Vector3 = new Vector3(0, 0, 0);
}