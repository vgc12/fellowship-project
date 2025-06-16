export type Shader = {

    vertexCode: string;
    fragmentCode: string

    vertexModule: GPUShaderModule;
    fragmentModule: GPUShaderModule

    vertexState: GPUVertexState;
    fragmentState: GPUFragmentState;

}

