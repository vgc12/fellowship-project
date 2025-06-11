import type {Mesh} from "./mesh.ts";
import type {mat4} from "gl-matrix";

export interface IRenderable {
    mesh: Mesh;
    modelMatrix : mat4

    update(): void;
}