import vertexShader from './default.vert.wgsl';
import fragmentShader from './default.frag.wgsl';

import { ShaderBuilder } from './shader.ts';
import {Mesh, MeshBuilder} from './mesh.ts';
import { WebGPUSingleton } from './webgpu-device.ts';

import {RenderableObject} from "./renderable-object.ts";
import {Deg2Rad} from "./math-util.ts";
import {Camera} from "./Camera.ts";




export class Renderer {

    canvas: HTMLCanvasElement;
    context: GPUCanvasContext;
    format: GPUTextureFormat;


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }


    async initialize() {
        if (!navigator.gpu) {
            console.error('WebGPU is not supported. Please enable it in your browser settings.');
        }


        this.context = this.canvas.getContext('webgpu') as GPUCanvasContext;


        // Request a GPU adapter and device
        // An adapter is a link between the browser and the GPU hardware.
        // Allows for getting information about the GPU and creating a device to interact with it.
        
        await WebGPUSingleton.initialize();

        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            format: this.format,
            device: WebGPUSingleton.device,
            alphaMode: 'premultiplied',
        });


        const camera = new Camera();
        camera.transform.setPosition(0, 0, 5);
        camera.update();

        const meshBuilder = new MeshBuilder();

        const mesh : Mesh =  meshBuilder.setVertices(new Float32Array([
                1,1,0,
                0,1,0,
                0,1,1,
                1,1,1,
                1,0,0,
                1,0,1,
                0,0,1,
                0,0,0,
            ]),
        ).setIndices(new Uint16Array([
            0,1,2, // top triangle
            0,2,3, // top triangle
            0,4,7, // back left triangle
            0,7,1, // back left triangle
            1,2,7, // back right triangle
            2,6,7, // back right triangle
            3,5,6, // front right triangle
            3,6,2, // front right triangle
            4,6,3, // front left triangle
            0,3,4, // front left triangle
            4,5,6, // bottom triangle
            4,6,7,  // bottom triangle
        ])).setVertexBufferLayout({
            arrayStride: 12,
            attributes: [{
                shaderLocation: 0,
                format: 'float32x3',
                offset: 0,
            }],
        }).build();



        const cube = new RenderableObject();
        cube.mesh = mesh;
        //cube.transform.setPosition(0, 0, -5);
        const rotation = Deg2Rad(45);
        cube.transform.setRotation(rotation, rotation, 0);
        cube.transform.setPosition(0,0,0);
        cube.update();

        const shaderBuilder = new ShaderBuilder();
        const shader = shaderBuilder
            .setVertexCode(vertexShader, 'main')
            .addVertexBufferLayout(cube.mesh.vertexBufferLayout)
            .setFragmentCode(fragmentShader, 'main')
            .addColorFormat(this.format)
            .build();


        /* Configure Pipeline
         *  The pipeline is a collection of shaders and state that defines how the GPU will render graphics.
         *  VERTEX: A vertex shader is a program that runs on the GPU and does some operation on each vertex being drawn.
         *  FRAGMENT: A fragment shader is a program that runs on the GPU and does some operation on each .
         * */

        const uniformBuffer = WebGPUSingleton.device.createBuffer({
            label: "uniform buffer",
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: 64 * 3 //3 matrix 4x4, so 4 bytes * 4 rows * 4 columns * 3
        });

        const bindGroupLayout :GPUBindGroupLayout = WebGPUSingleton.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {}
            }
            ]
        })

        const bindGroup : GPUBindGroup = WebGPUSingleton.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer
                }
            }]
        });

        const pipelineLayout : GPUPipelineLayout = WebGPUSingleton.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        const pipeline = await WebGPUSingleton.device.createRenderPipelineAsync({
            vertex: shader.vertexState,

            fragment: shader.fragmentState,

            layout: pipelineLayout,
            primitive: {
                topology: 'triangle-list',

            },
        });




// The GPUCommandEncoder is used to record commands that will be executed by the GPU.
        const commandEncoder: GPUCommandEncoder = WebGPUSingleton.device.createCommandEncoder();
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
        console.log(camera.viewMatrix);
        console.log(camera.projectionMatrix);
        console.log(cube.modelMatrix);
     console.log("M × V × P:", cube.modelMatrix, camera.viewMatrix, camera.projectionMatrix);

        WebGPUSingleton.device.queue.writeBuffer(uniformBuffer, 0, cube.modelMatrix as ArrayBuffer);
        WebGPUSingleton.device.queue.writeBuffer(uniformBuffer, 64, camera.viewMatrix as ArrayBuffer);
        WebGPUSingleton.device.queue.writeBuffer(uniformBuffer, 128, camera.projectionMatrix as ArrayBuffer);
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: [0.0, 0.0, 0.0, .7],
                loadOp: 'clear', // Clear the canvas before rendering
                storeOp: 'store', // Store the rendered image in the canvas
            }],
        };

// Begin a render pass
// A render pass is a collection of commands that will be executed by the GPU to render graphics.
        const passEncoder: GPURenderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline); // Set the pipeline to use for rendering

        passEncoder.setIndexBuffer(cube.mesh.indexBuffer as GPUBuffer, "uint16");
        passEncoder.setVertexBuffer(0, cube.mesh.vertexBuffer);
        passEncoder.setBindGroup(0, bindGroup);
        console.log(cube.mesh.vertexCount);
        passEncoder.drawIndexed(12, 1, 0, 0,0); // Draw a triangle (3 vertices) (1 instance)
        passEncoder.end(); // End the render pass, this will execute the commands recorded in the pass encoder.

// Submit the commands to the GPU for execution
        WebGPUSingleton.device.queue.submit([commandEncoder.finish()]);

    }


}