export class Mesh  {
    Device: GPUDevice
    Vertices: Float32Array
    VertexCount: number
    VertexBuffer: GPUBuffer
    Indices? : Uint16Array
    IndexBuffer? : GPUBuffer
    IndexBufferDescriptor? :GPUBufferDescriptor
    VertexBufferLayout: GPUVertexBufferLayout
    VertexBufferDescriptor: GPUBufferDescriptor


}

export class MeshBuilder {
    private device: GPUDevice;
    private vertices: Float32Array;
    private indices?: Uint16Array;
    private vertexBufferLayout?: GPUVertexBufferLayout;

    clear(){
        this.vertices = new Float32Array();
        this.indices = new Uint16Array();
    }

    constructor(device: GPUDevice) {
        this.device = device;
        this.clear();
    }

    setVertices(vertices: Float32Array): MeshBuilder {
        this.vertices = vertices;
        return this;
    }

    setIndices(indices: Uint16Array): MeshBuilder {
        this.indices = indices;
        return this;
    }

    setVertexBufferLayout(layout: GPUVertexBufferLayout): MeshBuilder {
        this.vertexBufferLayout = layout;
        return this;
    }

    build(): Mesh {
        if (!this.vertices) {
            throw new Error("Vertices must be provided");
        }
        if (!this.vertexBufferLayout) {
            throw new Error("Vertex buffer layout must be provided");
        }

        // Create vertex buffer
        const vertexBuffer = this.device.createBuffer({
            size: this.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(vertexBuffer, 0, this.vertices);

        // Create index buffer if indices provided
        let indexBuffer: GPUBuffer | undefined;
        if (this.indices) {
            indexBuffer = this.device.createBuffer({
                size: this.indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            });
            this.device.queue.writeBuffer(indexBuffer, 0, this.indices);
        }

        const mesh = {

            Indices: this.indices,
            VertexBuffer: vertexBuffer,
            VertexBufferLayout: this.vertexBufferLayout,
            VertexCount: this.calculateVertexCount(),
            Vertices: this.vertices,
            VertexBufferDescriptor: vertexBuffer,
            IndexBufferDescriptor: indexBuffer,
            Device: this.device
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
            taking the length of this (15) and dividing it by the stride (20 bytes / 4 bytes per number)
            would get me three vertices.
         */
        return this.vertexBufferLayout?.arrayStride != null ? this.vertices.length / (this.vertexBufferLayout?.arrayStride / 4) : 0;
    }


}