import  {Mesh } from "../graphics/3d/mesh.ts";
import type {IObject} from "./IObject.ts";
import type {IRenderable} from "./IRenderable.ts";
import  {Transform } from "../core/math/transform.ts";
import {type Mat4, mat4} from "wgpu-matrix";
import {Deg2Rad} from "../core/math/math-util.ts";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";

export class RenderableObject implements IObject, IRenderable {
    get guid(): string {
        return this._guid;
    }
    get mesh(): Mesh {
        return this._mesh;
    }

    set mesh(value: Mesh) {
        this._mesh = value;
    }
    get modelMatrix(): Mat4{
        return this._modelMatrix;
    }
    get transform(): Transform {
        return this._transform;
    }
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    private _name: string;
    private readonly _transform: Transform;
    private _modelMatrix: Mat4
    private _mesh: Mesh;

    constructor() {
        this._name = '';
        this._transform = new Transform();
        this._modelMatrix = mat4.identity();
        this._guid = crypto.randomUUID();

        mat4.translate(this._modelMatrix, this._transform.position.toArray, this._modelMatrix);
        this._mesh = new Mesh();
        $WGPU.addObject(this);
        $WGPU.addRenderable(this);


    }

    private _guid: string;

    update() {
        this._modelMatrix = mat4.identity();

         // Update the transformation matrix based on the transform's position, rotation, and scale
         mat4.translate(this._modelMatrix,  this.transform.position.toArray, this._modelMatrix);
         // Apply rotations in the order of X, Y, Z
         mat4.rotateX(this._modelMatrix, Deg2Rad(this.transform.rotation.x), this._modelMatrix )
         mat4.rotateY(this._modelMatrix, Deg2Rad(this.transform.rotation.y), this._modelMatrix )
         mat4.rotateZ(this._modelMatrix, Deg2Rad(this.transform.rotation.z), this._modelMatrix )
         // Apply scaling
         mat4.scale(this._modelMatrix, this.transform.scale.toArray, this._modelMatrix)
    }
}