import  {Mesh } from "./mesh.ts";
import type {IObject} from "./IObject.ts";
import type {IRenderable} from "./IRenderable.ts";
import  {Transform } from "./transform.ts";
import {type Mat4, mat4} from "wgpu-matrix";

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
        this._modelMatrix = mat4.create();
        this.transform.setPosition(1,0,0);
        mat4.translate(this._modelMatrix, this._transform.position, this._modelMatrix);
        this._mesh = new Mesh();
    }

    update() {
        //if(this._mesh === new Mesh()) throw new Error('Mesh is not set, a RenderableObject must have a mesh to be rendered');
         mat4.translate(this._modelMatrix,  this.transform.position, this._modelMatrix);

    }
}