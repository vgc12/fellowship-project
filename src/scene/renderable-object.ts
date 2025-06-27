import  {Mesh } from "../graphics/3d/mesh.ts";
import type {IObject} from "./IObject.ts";
import type {IRenderable} from "./IRenderable.ts";
import  {Transform } from "../core/math/transform.ts";
import {type Mat4, mat4} from "wgpu-matrix";
import {convertToRadians} from "../core/math/math-util.ts";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";
import { Material } from "@/graphics/3d/material.ts";

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

    get modelMatrix(): Mat4 {
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
        $WGPU.addRenderableObject(this);
        $WGPU.addObject(this);

        this.material = Material.default;

    }

    material: Material;
    
    private readonly _guid: string;
    


    update() {
        this._modelMatrix = mat4.identity();

         // Update the transformation matrix based on the transform's position, rotation, and scale
         mat4.translate(this._modelMatrix,  this.transform.position.toArray, this._modelMatrix);
         // Apply rotations in the order of X, Y, Z
         mat4.rotateX(this._modelMatrix, convertToRadians(this.transform.eulerAngles.x), this._modelMatrix )
         mat4.rotateY(this._modelMatrix, convertToRadians(this.transform.eulerAngles.y), this._modelMatrix )
         mat4.rotateZ(this._modelMatrix, convertToRadians(this.transform.eulerAngles.z), this._modelMatrix )
         // Apply scaling


         mat4.scale(this._modelMatrix, this.transform.scale.toArray, this._modelMatrix)


    }
}