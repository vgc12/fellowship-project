
import { $WGPU } from './webgpu-singleton.ts';



export class Mesh  {
  
    vertices: Float32Array;
    vertexCount: number;
    vertexBuffer: GPUBuffer;
    indices? : Uint16Array;
    indexBuffer? : GPUBuffer;

}

export class MeshBuilder {

    private _vertices: Float32Array;
    private _indices?: Uint16Array;

    clear() {
        this._vertices = new Float32Array();
        this._indices = new Uint16Array();
    }

    constructor() {
       
        this.clear();
    }

    setVertices(vertices: Float32Array): MeshBuilder {
        this._vertices = vertices;
        return this;
    }

    setIndices(indices: Uint16Array): MeshBuilder {
        this._indices = indices;
        return this;
    }



    build(): Mesh {
        if (!this._vertices) {
            throw new Error('Vertices must be provided');
        }


        // Create vertex buffer
        const vertexBuffer = $WGPU.device.createBuffer({
            size: this._vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        $WGPU.device.queue.writeBuffer(vertexBuffer, 0, this._vertices);

        // Create index buffer if indices provided
        let indexBuffer: GPUBuffer | undefined;
        if (this._indices) {
            indexBuffer = $WGPU.device.createBuffer({
                size: this._indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            });
            $WGPU.device.queue.writeBuffer(indexBuffer, 0, this._indices);
        }

        const mesh = {

            indices: this._indices,
            vertexBuffer: vertexBuffer,
            vertexBufferLayout: $WGPU.vertexBufferLayout,
            vertexCount: this.calculateVertexCount(),
            vertices: this._vertices,
            vertexBufferDescriptor: vertexBuffer,
            indexBuffer: indexBuffer,

        };
        this.clear();
        return mesh;
    }

    private calculateVertexCount(): number {
        /* In theory, this should get the amount of vertices
            if i have an array that has a position: vec3 and a texture coordinate: vec2 (this is a random array)
              x y z u v
            [
                1, 0, 1, 1, 1,
                0, 1, 1, 1, 1,
                1, 1, 1 -1, -1,
            ]
            taking the length of this (15) and dividing it by the stride / 4 (20 bytes / 4 bytes per number)
            would get me three vertices.
         */
        return $WGPU.vertexBufferLayout?.arrayStride != null
            ? this._vertices.length / ($WGPU.vertexBufferLayout?.arrayStride / 4)
            : 0;
    }


}