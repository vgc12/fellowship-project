import vertexShader from '../../graphics/shaders/default.vert.wgsl';
import fragmentShader from '../../graphics/shaders/default.frag.wgsl';

import {type Shader} from '@/graphics/shader-utils/shader.ts';

import { $WGPU }  from '../webgpu/webgpu-singleton.ts';
import {ShaderBuilder} from "@/graphics/shader-utils/shader-builder.ts";
import {Light, lightType} from "@/scene/point-light.ts";
import type {SpotLight} from "@/scene/spot-light.ts";





export class Renderer {

    objectUniformBuffer: GPUBuffer;
    frameBindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    objectStorageBuffer: GPUBuffer;
    passEncoder: GPURenderPassEncoder;
    commandEncoder: GPUCommandEncoder;
    textureView: GPUTextureView;
    depthTexture: GPUTexture;
    modelMatrices : Float32Array;
    lightStorageBuffer : GPUBuffer;
    lightBindGroup: GPUBindGroup;
    lightUniformBuffer: GPUBuffer;



    async initialize() {
        if (!navigator.gpu) {
            console.error('WebGPU is not supported. Please enable it in your browser settings.');
        }



        const shaderBuilder = new ShaderBuilder();
        const shader = shaderBuilder
            .setVertexCode(vertexShader, 'main')
            .addVertexBufferLayout($WGPU.vertexBufferLayout as GPUVertexBufferLayout)
            .setFragmentCode(fragmentShader, 'main')
            .addColorFormat($WGPU.format)
            .build();


        /* Configure Pipeline
         *  The pipeline is a collection of shaders and state that defines how the GPU will render graphics.
         *  VERTEX: A vertex shader is a program that runs on the GPU and does some operation on each vertex being drawn.
         *  FRAGMENT: A fragment shader is a program that runs on the GPU and does some operation on each .
         * */
        this.setUpBuffers();

        this.setUpBindGroups();
        await this.setupShaderPipeline(shader);
        const windowDimensions = $WGPU.windowDimensions;
        // Create a depth texture to be used for depth testing.
        // Depth testing is a technique used to determine which objects are in front of others, so objects are rendered in the correct order.
        this.depthTexture = $WGPU.device.createTexture({
            size: windowDimensions,
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,

        });

        this.modelMatrices = new Float32Array(16 * 1024);
    }

    private async setupShaderPipeline(shader: Shader) {
        const pipelineLayout: GPUPipelineLayout = $WGPU.device.createPipelineLayout({
            bindGroupLayouts: [$WGPU.frameBindGroupLayout, $WGPU.textureBindGroupLayout, $WGPU.lightBindGroupLayout],
        });

        this.pipeline = await $WGPU.device.createRenderPipelineAsync({
            vertex: shader.vertexState,

            fragment: shader.fragmentState,

            layout: pipelineLayout,
            primitive: {
                topology: 'triangle-list',
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth24plus-stencil8"
            },

        });
    }

    private setUpBuffers() {
        this.objectUniformBuffer = $WGPU.device.createBuffer({
            label: "uniform buffer",
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: (64 * 2) + (4*4) //2 matrix 4x4, so 4 bytes * 4 rows * 4 columns * 2 matrices
        });

        // Write the uniform data to the uniform buffer.
        this.objectStorageBuffer = $WGPU.device.createBuffer({
            label: "storage buffer",
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            size: 64 * 1024 // I can store 1024 matrices in this buffer, each matrix is 64 bytes (4x4 matrix)
        });

        this.lightStorageBuffer = $WGPU.device.createBuffer({
            label: "light storage buffer",
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            size: 24 * 64
        });

        this.lightUniformBuffer = $WGPU.device.createBuffer({
            label : "light uniform buffer",
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size : 4
        })


    }

    private setUpBindGroups() {


        this.frameBindGroup = $WGPU.device.createBindGroup({
            label: "Frame Bind Group",
            layout: $WGPU.frameBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.objectUniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.objectStorageBuffer
                    }
                }

            ]
        });

        this.lightBindGroup = $WGPU.device.createBindGroup({
            layout: $WGPU.lightBindGroupLayout,
            label: "Light Bind Group",
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.lightStorageBuffer
                    }

                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.lightUniformBuffer
                    }
                }
            ]
        });


    }

    private writeFrameGroupBuffers() {
        const modelMatrices = this.createModelMatrixArray();
        $WGPU.device.queue.writeBuffer(this.objectStorageBuffer, 0, modelMatrices as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.objectUniformBuffer, 0, $WGPU.mainCamera.viewMatrix as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.objectUniformBuffer, 64, $WGPU.mainCamera.projectionMatrix as ArrayBuffer);
        const pos = $WGPU.mainCamera.transform.position;
        const posBuffer = new Float32Array(pos.toArray);

        $WGPU.device.queue.writeBuffer(this.objectUniformBuffer, 128, posBuffer as ArrayBuffer);


    }

    private writeLightBuffer() {
        const lightArray = this.createLightArray();
        $WGPU.device.queue.writeBuffer(this.lightStorageBuffer, 0, lightArray as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.lightUniformBuffer, 0, new Int32Array([$WGPU.lights.length])); // Store the number of lights in the first float of the buffer
    }

// Puts every value of the model matrix from each object to be drawn into one array
    private createModelMatrixArray() {


        for (let renderableIndex = 0; renderableIndex < $WGPU.renderableObjects.length; renderableIndex++) {

            const renderable = $WGPU.renderableObjects[renderableIndex];

            for (let MATRIX_POSITION = 0; MATRIX_POSITION < renderable.modelMatrix.length; MATRIX_POSITION++) {

                this.modelMatrices[16 * renderableIndex + MATRIX_POSITION] = renderable.modelMatrix[MATRIX_POSITION];
            }

        }

        return this.modelMatrices;

    }

    private createLightArray () {

        const LIGHT_STRIDE = 24;
        const OFFSETS = {
            POSITION: 0,
            INTENSITY: 3,
            COLOR: 4,
            LIGHT_TYPE: 7,
            LIGHT_PARAMS: 8,
            UP_VECTOR: 12,
            RIGHT_VECTOR: 16,
            FORWARD_VECTOR: 20
        } as const ;

        const lights = $WGPU.lights;

        const lightArray = new Float32Array(LIGHT_STRIDE * lights.length);

        function setVector( vector: number[], offset: number,padding : number = 0) {

            for (let i = 0; i < vector.length; i++) {
                lightArray[offset + i] = vector[i];
            }

            for (let i = 0; i < padding; i++) {
                lightArray[offset + vector.length + i] = 0;
            }

        }

        function setLightParams( offset : number, light : Light) {
            lightArray.fill(0, offset, offset + 4);

            if (light.lightType === lightType.AREA) {
                const l = light as SpotLight;

                lightArray[offset] = l.innerAngleRadians;
                lightArray[offset + 1] = l.outerAngleRadians;
            }

        }

        lights.forEach((light, i) => {
            const offset = i * LIGHT_STRIDE;

            // Position (3 floats)
            setVector(light.transform.position.toArray, offset + OFFSETS.POSITION, );

            // Intensity (1 float)
            lightArray[offset + OFFSETS.INTENSITY] = light.intensity;

            // Color (3 floats)
            setVector( light.color.toArray, offset + OFFSETS.COLOR,);

            // Light type (1 float)
            lightArray[offset + OFFSETS.LIGHT_TYPE] = light.lightType;

            // Light-specific parameters (4 floats)
            setLightParams(offset + OFFSETS.LIGHT_PARAMS, light);

            // Transform vectors (3x4 floats each, with padding)
            const structPadding = 1;
            console.log(light.transform.forward);
            setVector(light.transform.up.toArray, offset + OFFSETS.UP_VECTOR,  structPadding);

            setVector(light.transform.right.toArray, offset + OFFSETS.RIGHT_VECTOR, structPadding);
            setVector(light.transform.forward.toArray, offset + OFFSETS.FORWARD_VECTOR,  structPadding);

        });

        return lightArray;
    }

    update() {

        this.writeFrameGroupBuffers();

        this.writeLightBuffer();


        // The GPUTextureView is used to specify the texture that will be rendered to.
        this.textureView = $WGPU.context.getCurrentTexture().createView(
            {
                format: $WGPU.format, // The format of the texture used by the canvas.
                dimension: '2d', // The dimension of the texture (2D, 3D, cube, etc.)
                aspect: 'all', // The aspect of the texture (color, depth, stencil, etc.)
                baseMipLevel: 0, // The base mip level of the texture (0 for no mipmapping).
                // Mipmapping is a technique used to improve rendering performance by using lower resolution textures for objects that are farther away from the camera.
                // Mipmapping also makes textures look better when viewed at a distance. (especially textures like a checkerboard pattern or grid pattern)
                mipLevelCount: 1, // How many mip levels the texture has (1 for no mipmapping)
                baseArrayLayer: 0, // The base array layer of the texture (0 for no array layers) an array layer is a slice of a texture that can be used for 3D textures or texture arrays.
                arrayLayerCount: 1, // The number of array layers in the texture (1 for no array layers)
            },
        );






        // Create a render pass descriptor with a depth texture and a color attachment, this color attachment is the color of background of the canvas.
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{

                view: this.textureView, // The texture view that will be rendered to belonging to the canvas.
                clearValue: [.6, 0.3, 0.3, 1.0],
                loadOp: 'clear', // Clear the canvas before rendering
                storeOp: 'store', // Store the rendered image in the canvas
            }],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                stencilLoadOp: 'clear',
                stencilStoreOp: 'store',
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };
        // The GPUCommandEncoder is used to record commands that will be executed by the GPU.
        this.commandEncoder = $WGPU.device.createCommandEncoder();
        // Begin a render pass
        // A render pass is a collection of commands that will be executed by the GPU to render graphics.
        this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);

        // Set the pipeline to use for rendering
        this.passEncoder.setPipeline(this.pipeline);




        let objectsDrawn = 0;
        this.passEncoder.setBindGroup(2, this.lightBindGroup);
        this.passEncoder.setBindGroup(0, this.frameBindGroup);


        $WGPU.renderableObjects.forEach((renderable) => {



            this.passEncoder.setBindGroup(1, renderable.material.bindGroup)

            if(renderable.mesh.indexBuffer != undefined && renderable.mesh.indices?.length !== 0){

                this.passEncoder.setIndexBuffer(renderable.mesh.indexBuffer as GPUBuffer, "uint16");
                this.passEncoder.setVertexBuffer(0, renderable.mesh.vertexBuffer);
                this.passEncoder.drawIndexed(renderable.mesh.indices?.length ?? 0, 1,0,0, objectsDrawn);

            }
            else {

                this.passEncoder.setVertexBuffer(0, renderable.mesh.vertexBuffer)
                this.passEncoder.draw(renderable.mesh.vertexCount, 1,0,objectsDrawn);
            }
            objectsDrawn++;
        });

        this.passEncoder.end();

        // Submit the commands to the GPU for execution
        $WGPU.device.queue.submit([this.commandEncoder.finish()]);
    }

}