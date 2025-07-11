import vertexShader from '../../graphics/shaders/default.vert.wgsl';
import fragmentShader from '../../graphics/shaders/default.frag.wgsl';

import {type Shader} from '@/graphics/shader-utils/shader.ts';

import { $WGPU }  from '../webgpu/webgpu-singleton.ts';
import {ShaderBuilder} from "@/graphics/shader-utils/shader-builder.ts";
import {lightType} from "@/scene/point-light.ts";
import type {AreaLight} from "@/scene/area-light.ts";




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
            size: 24 * 64  // I can store 64 lights in this buffer, each light is 8 bytes (4x2 vector)
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
        $WGPU.device.queue.writeBuffer(this.lightUniformBuffer, 0, new Int32Array([lightArray.length])); // Store the number of lights in the first float of the buffer
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
        const lights = $WGPU.lights;

        const lightArray = new Float32Array(24 * lights.length);
        for (let i = 0; i < lights.length; i++) {
            const light = lights[i];
            const j = i * 24; // Each light takes up 8 floats in the array
            lightArray[j] = light.transform.position.x;
            lightArray[j + 1] = light.transform.position.y;
            lightArray[j + 2] = light.transform.position.z;
            lightArray[j + 3] = light.intensity; // Intensity of the light
            lightArray[j + 4] = light.color.x; // Red component of the light color
            lightArray[j + 5] = light.color.y; // Green component of the light color
            lightArray[j + 6] = light.color.z; // Blue component of the light color
            lightArray[j + 7] = light.lightType;
            if(light.lightType === lightType.POINT) {
                lightArray[j + 8] = 0; // Padding for point lights
                lightArray[j + 9] = 0; // Padding for point lights
                lightArray[j + 10] = 0; // Padding for point lights
                lightArray[j + 11] = 0;
                console.log(lights.length)
            }
            else if(light.lightType === lightType.AREA) {
                const al = light as AreaLight;
                lightArray[j + 8] = al.width; // Width of the area light
                lightArray[j + 9] = al.height; // Height of the area light
                lightArray[j + 10] = 0; // Padding for point lights
                lightArray[j + 11] = 0;
            }
            // come back for area lights

            lightArray[j + 12] = light.transform.up.x; // Up vector x component
            lightArray[j + 13] = light.transform.up.y; // Up vector y component
            lightArray[j + 14] = light.transform.up.z; // Up vector z component
            lightArray[j + 15] = 0; // Padding for up vector
            lightArray[j + 16] = light.transform.right.x; // Right vector x component
            lightArray[j + 17] = light.transform.right.y; // Right vector y component
            lightArray[j + 18] = light.transform.right.z; // Right vector z component
            lightArray[j + 19] = 0; // Padding for right vector
            lightArray[j + 20] = light.transform.forward.x; // Forward vector x component
            lightArray[j + 21] = light.transform.forward.y; // Forward vector y component
            lightArray[j + 22] = light.transform.forward.z; // Forward vector z component
            lightArray[j + 23] = 0; // Padding for forward vector

        }
        console.log(lightArray);
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
                clearValue: [.3, 0.3, 0.3, 1.0],
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