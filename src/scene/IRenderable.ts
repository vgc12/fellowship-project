import type {Mesh} from "../graphics/3d/mesh.ts";
import type {Mat4} from "wgpu-matrix";

export interface IRenderable {
    mesh: Mesh;
    modelMatrix : Mat4

    update(): void;
}