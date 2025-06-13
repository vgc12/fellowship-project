import {$WGPU} from "./webgpu-device.ts";


export type Shader = {

    vertexCode: string;
    fragmentCode: string

    vertexModule: GPUShaderModule;
    fragmentModule: GPUShaderModule

    vertexState: GPUVertexState;
    fragmentState: GPUFragmentState;

}

export class ShaderBuilder {

    

    private _vertexCode: string;
    private _fragmentCode: string;

    private _vertexEntryPoint: string;
    private _fragmentEntryPoint: string;

    private _vertexModule: GPUShaderModule;
    private _fragmentModule: GPUShaderModule;

    private _vertexState: GPUVertexState;
    private _fragmentState: GPUFragmentState;

    private _colorTargetStates: GPUColorTargetState[];

    private _bufferLayouts : GPUVertexBufferLayout[];

    constructor() {
        
        this.clear();
    }

    clear() {
        this._bufferLayouts = [];
        this._vertexCode = '';
        this._fragmentCode = '';
        this._colorTargetStates = [];
    }

    addVertexBufferLayout(vertexBuffer: GPUVertexBufferLayout)
    {
        this._bufferLayouts.push(vertexBuffer);
        return this;
    }

    setVertexCode(vertexShaderCode : string, entryPoint: string) {
       this._vertexCode = vertexShaderCode;
       this._vertexEntryPoint = entryPoint;
        return this;
    }

    setFragmentCode(fragmentShaderCode :string, entryPoint: string) {
        this._fragmentCode = fragmentShaderCode;
        this._fragmentEntryPoint = entryPoint;
        return this;
    }

    addColorFormat(format: GPUTextureFormat) {
        this._colorTargetStates.push({
            format: format,
        });
        return this;
    }


    build(): Shader {
        this._fragmentModule = $WGPU.device.createShaderModule({
            code: this._fragmentCode,
        });

        this._vertexModule = $WGPU.device.createShaderModule({
            code: this._vertexCode,
        });

        this._vertexState = {
            module: this._vertexModule,
            entryPoint: this._vertexEntryPoint,
            buffers: this._bufferLayouts,
        };

        this._fragmentState = {
            entryPoint: this._fragmentEntryPoint,
            module: this._fragmentModule,
            targets: this._colorTargetStates,
        };

        const shader : Shader = {
            vertexCode : this._vertexCode,
            fragmentCode: this._fragmentCode,
            vertexModule: this._vertexModule,
            fragmentModule: this._fragmentModule,
            vertexState: this._vertexState,
            fragmentState: this._fragmentState,
        };

        this.clear();

        return shader;



    }
}