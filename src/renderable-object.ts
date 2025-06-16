import  {Mesh } from "./mesh.ts";
import type {IObject} from "./IObject.ts";
import type {IRenderable} from "./IRenderable.ts";
import  {Transform } from "./transform.ts";
import {type Mat4, mat4} from "wgpu-matrix";
import {Deg2Rad} from "./math-util.ts";
import {$WGPU} from "./webgpu-singleton.ts";

export class RenderableObject implements IObject, IRenderable {
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


        mat4.translate(this._modelMatrix, this._transform.position, this._modelMatrix);
        this._mesh = new Mesh();
        $WGPU.addObject(this);
        $WGPU.addRenderable(this);


    }

    update() {
        this._modelMatrix = mat4.identity();

         // Update the transformation matrix based on the transform's position, rotation, and scale
         mat4.translate(this._modelMatrix,  this.transform.position, this._modelMatrix);
         // Apply rotations in the order of X, Y, Z
         mat4.rotateX(this._modelMatrix, Deg2Rad(this.transform.rotation[0]), this._modelMatrix )
         mat4.rotateY(this._modelMatrix, Deg2Rad(this.transform.rotation[1]), this._modelMatrix )
         mat4.rotateZ(this._modelMatrix, Deg2Rad(this.transform.rotation[2]), this._modelMatrix )
         // Apply scaling
         mat4.scale(this._modelMatrix, this.transform.scale, this._modelMatrix)
    }
}