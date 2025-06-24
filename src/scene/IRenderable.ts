import type {Mesh} from "../graphics/3d/mesh.ts";
import type {Mat4} from "wgpu-matrix";
import type {Material} from "@/graphics/3d/material.ts";

export interface IRenderable {
    mesh: Mesh;
    modelMatrix : Mat4
    material: Material;
    update(): void;
}