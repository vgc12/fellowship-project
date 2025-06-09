

export type Shader = {

    VertexCode: string;
    FragmentCode: string

    VertexModule: GPUShaderModule;
    FragmentModule: GPUShaderModule

    VertexState: GPUVertexState;
    FragmentState: GPUFragmentState;

}

export class ShaderBuilder{

    private device: GPUDevice;

    private vertexCode: string;
    private fragmentCode: string

    private vertexEntryPoint: string;
    private fragmentEntryPoint: string;

    private vertexModule: GPUShaderModule;
    private fragmentModule: GPUShaderModule

    private vertexState: GPUVertexState;
    private fragmentState: GPUFragmentState;

    private colorTargetStates: GPUColorTargetState[];

    private bufferLayouts : GPUVertexBufferLayout[];

    constructor(device: GPUDevice) {
        this.device = device;
        this.clear();
    }

    clear() {
        this.bufferLayouts = [];
        this.vertexCode = "";
        this.fragmentCode = "";
        this.colorTargetStates = [];
    }

    addVertexBufferLayout(vertexBuffer: GPUVertexBufferLayout)
    {
        this.bufferLayouts.push(vertexBuffer)
        return this;
    }

    setVertexCode(vertexShaderCode : string, entryPoint: string){
       this.vertexCode = vertexShaderCode;
       this.vertexEntryPoint = entryPoint;
        return this;
    }

    setFragmentCode(fragmentShaderCode :string, entryPoint: string){
        this.fragmentCode = fragmentShaderCode;
        this.fragmentEntryPoint = entryPoint;
        return this;
    }

    addColorFormat(format: GPUTextureFormat) {
        this.colorTargetStates.push({
            format: format
        });
        return this;
    }


    build(): Shader{
        this.fragmentModule = this.device.createShaderModule({
            code: this.fragmentCode
        });

        this.vertexModule = this.device.createShaderModule({
            code: this.vertexCode
        });

        this.vertexState = {
            module: this.vertexModule,
            entryPoint: this.vertexEntryPoint,
            buffers: this.bufferLayouts
        }

        this.fragmentState = {
            entryPoint: this.fragmentEntryPoint,
            module: this.fragmentModule,
            targets: this.colorTargetStates
        }

        const shader : Shader = {
            VertexCode : this.vertexCode,
            FragmentCode: this.fragmentCode,
            VertexModule: this.vertexModule,
            FragmentModule: this.fragmentModule,
            VertexState: this.vertexState,
            FragmentState: this.fragmentState
        }

        this.clear();

        return shader;



    }
}