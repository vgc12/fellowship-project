import vertexShader from './default.vert.wgsl';
import fragmentShader from './default.frag.wgsl';

import { ShaderBuilder } from './shader.ts';

import { $WGPU }  from './webgpu-singleton.ts';




export class Renderer {

    canvas: HTMLCanvasElement;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
    uniformBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    storageBuffer: GPUBuffer;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }


    async initialize() {
        if (!navigator.gpu) {
            console.error('WebGPU is not supported. Please enable it in your browser settings.');
        }


        this.context = this.canvas.getContext('webgpu') as GPUCanvasContext;




        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            format: this.format,
            device: $WGPU.device,
            alphaMode: 'premultiplied',
        });


        const shaderBuilder = new ShaderBuilder();
        const shader = shaderBuilder
            .setVertexCode(vertexShader, 'main')
            .addVertexBufferLayout($WGPU.vertexBufferLayout as GPUVertexBufferLayout)
            .setFragmentCode(fragmentShader, 'main')
            .addColorFormat(this.format)
            .build();


        /* Configure Pipeline
         *  The pipeline is a collection of shaders and state that defines how the GPU will render graphics.
         *  VERTEX: A vertex shader is a program that runs on the GPU and does some operation on each vertex being drawn.
         *  FRAGMENT: A fragment shader is a program that runs on the GPU and does some operation on each .
         * */

        this.uniformBuffer = $WGPU.device.createBuffer({
            label: "uniform buffer",
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: 64 * 3 //3 matrix 4x4, so 4 bytes * 4 rows * 4 columns * 3 matrices
        });

        // Write the uniform data to the uniform buffer.
        this.storageBuffer = $WGPU.device.createBuffer({
            label: "storage buffer",
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            size: 64 * 1024 // I can store 1024 matrices in this buffer, each matrix is 64 bytes (4x4 matrix)
        });

        const bindGroupLayout :GPUBindGroupLayout = $WGPU.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {}
            },
            {
                binding : 1,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'read-only-storage',
                    hasDynamicOffset: false
                }
            }
            ]
        })

        this.bindGroup = $WGPU.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
            {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
            },
            {
                binding: 1,
                resource: {
                    buffer: this.storageBuffer
                }
            }
            ]
        });

        const pipelineLayout : GPUPipelineLayout = $WGPU.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
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
                format: "depth24plus"
            }
        });






    }

    update() {
        // The GPUCommandEncoder is used to record commands that will be executed by the GPU.
        const commandEncoder: GPUCommandEncoder = $WGPU.device.createCommandEncoder();
        // The GPUTextureView is used to specify the texture that will be rendered to.
        const textureView: GPUTextureView = this.context.getCurrentTexture().createView(
            {
                format: this.format, // The format of the texture used by the canvas.
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


        const modelMatrices = new Float32Array(16*1024);


        for (let renderableIndex = 0; renderableIndex < $WGPU.renderables.length; renderableIndex++){

            const renderable = $WGPU.renderables[renderableIndex];



            for(let MATRIX_POSITION = 0; MATRIX_POSITION < renderable.modelMatrix.length; MATRIX_POSITION++){

                modelMatrices[16 * renderableIndex + MATRIX_POSITION ] = renderable.modelMatrix[MATRIX_POSITION];

            }


        }




        $WGPU.device.queue.writeBuffer(this.storageBuffer, 0, modelMatrices as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.uniformBuffer, 0, $WGPU.camera.viewMatrix as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.uniformBuffer, 64, $WGPU.camera.projectionMatrix as ArrayBuffer);

        const windowDimensions = $WGPU.windowDimensions;

        // Create a depth texture to be used for depth testing.
        // Depth testing is a technique used to determine which objects are in front of others, so objects are rendered in the correct order.
        const depthTexture = $WGPU.device.createTexture({
            size: windowDimensions,
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
       // console.log(modelMatrices);

        // Create a render pass descriptor with a depth texture and a color attachment, this color attachment is the color of background of the canvas.
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView, // The texture view that will be rendered to belonging to the canvas.
                clearValue: [0.0, 0.0, 0.0, .7],
                loadOp: 'clear', // Clear the canvas before rendering
                storeOp: 'store', // Store the rendered image in the canvas
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };

        // Begin a render pass
        // A render pass is a collection of commands that will be executed by the GPU to render graphics.
        const passEncoder: GPURenderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        // Set the pipeline to use for rendering
        passEncoder.setPipeline(this.pipeline);


        passEncoder.setBindGroup(0, this.bindGroup);

        let objectsDrawn = 0;
        $WGPU.renderables.forEach((renderable) => {
            if(renderable.mesh.indexBuffer != undefined){

                passEncoder.setIndexBuffer(renderable.mesh.indexBuffer as GPUBuffer, "uint16");
                
                passEncoder.setVertexBuffer(0, renderable.mesh.vertexBuffer);
                passEncoder.drawIndexed(renderable.mesh.indices?.length ?? 0, 1,0,0, objectsDrawn);

            }
            else {

                passEncoder.setVertexBuffer(0, renderable.mesh.vertexBuffer)
                passEncoder.draw(renderable.mesh.vertexCount, 1,0,0);
            }
            objectsDrawn++;
        });

        passEncoder.end();
        // Draw the indices. The index array length ends up being the proper amount of vertices needed to draw
        /*
                // Set the index buffer to use for rendering
                passEncoder.setIndexBuffer(cube.mesh.indexBuffer as GPUBuffer, "uint16");
                // Set the vertex buffer to use for rendering
                passEncoder.setVertexBuffer(0, cube.mesh.vertexBuffer);
                // Set the bind group for the pipeline to be at location 0
                passEncoder.setBindGroup(0, this.bindGroup);

        passEncoder.drawIndexed(mesh.indices?.length ?? 0, 1);
        passEncoder.end(); // End the render pass, this will execute the commands recorded in the pass encoder.
 */
        // Submit the commands to the GPU for execution
        $WGPU.device.queue.submit([commandEncoder.finish()]);
    }
}