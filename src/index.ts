import vertexShader from './default.vert.wgsl';
import fragmentShader from './default.frag.wgsl';
import {Cube} from "./cube.ts";



if (!navigator.gpu) {
    console.error("WebGPU is not supported. Please enable it in your browser settings.");
}

const canvas : HTMLCanvasElement = document.querySelector('canvas') as HTMLCanvasElement;


// Request a GPU adapter and device
// An adapter is a link between the browser and the GPU hardware.
// Allows for getting information about the GPU and creating a device to interact with it.
const adapter : GPUAdapter | null = await navigator.gpu.requestAdapter();

// If the adapter is null, it means that the browser does not support WebGPU or the user has not enabled it.
const device : GPUDevice = await (adapter as GPUAdapter).requestDevice();


const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

/* Get the canvas context for WebGPU
 * The GPUCanvasContext is used to render graphics to the canvas.
 * The GPUCanvasContext also gives access to the current texture of the canvas.
 * The when calling context.getCurrentTexture() it will return a GPUTexture that the canvas uses to draw the image (i think).
 */
const context = canvas.getContext('webgpu') as GPUCanvasContext;
// The format of the texture used by the canvas.
const format : GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
    format: format,
    device: device,
    alphaMode: "premultiplied"
})

//create vertex shader module
const vertexModule = device.createShaderModule({
    code: vertexShader
});

//create fragment shader module
const fragmentModule = device.createShaderModule({
    code: fragmentShader
});



/* Configure Pipeline
 *  The pipeline is a collection of shaders and state that defines how the GPU will render graphics.
 *  VERTEX: A vertex shader is a program that runs on the GPU and does some operation on each vertex being drawn.
 *  FRAGMENT: A fragment shader is a program that runs on the GPU and does some operation on each .
 * */

const pipeline = await device.createRenderPipelineAsync({
    vertex: {
        module: vertexModule, // The vertex shader module that will be used to process the vertices.
        entryPoint : "main", // The entry point of the vertex shader (the function that will be called to process the vertices).
        buffers : [{
            arrayStride: 12, // The size of, each vertex in bytes (3 floats * 4 bytes per float)
            attributes: [
                {
                    format: "float32x3", // The format of the vertex data (3 floats per vertex, representing x, y, z coordinates)
                    offset: 0,
                    shaderLocation: 0
                }
            ]
        }]
    },

    fragment: {
        module: fragmentModule, // The fragment shader module that will be used to process the pixels.
        entryPoint: "main", // The entry point of the fragment shader (the function that will be called to process the pixels).
        targets: [{
            format: format // The format of the texture used by the canvas.
        }]
    },

    layout: "auto",
    primitive: {
        topology: "triangle-list",
        cullMode: "back"
    }
})

    const vertexBufferDescriptor : GPUBufferDescriptor = {
        size: 3 * 4, // The size of the buffer in bytes (3 vertices * 4 bytes per vertex)
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, // The buffer will be used as a vertex buffer and can be copied to.
        mappedAtCreation: true // The buffer will be mapped to memory when it is created.
    }
    const vertexBuffer : GPUBuffer = device.createBuffer(vertexBufferDescriptor);
    // The vertex data to be written to the buffer
    const cube : Cube = new Cube();

    device.queue.writeBuffer(vertexBuffer,0, cube.vertices);

    // The GPUCommandEncoder is used to record commands that will be executed by the GPU.
    const commandEncoder : GPUCommandEncoder = device.createCommandEncoder();
    // The GPUTextureView is used to specify the texture that will be rendered to.
    const textureView : GPUTextureView = context.getCurrentTexture().createView(
        {
            format: format, // The format of the texture used by the canvas.
            dimension: "2d", // The dimension of the texture (2D, 3D, cube, etc.)
            aspect: "all", // The aspect of the texture (color, depth, stencil, etc.)
            baseMipLevel: 0, // The base mip level of the texture (0 for no mipmapping).
            // Mipmapping is a technique used to improve rendering performance by using lower resolution textures for objects that are farther away from the camera.
            // Mipmapping also makes textures look better when viewed at a distance. (especially textures like a checkerboard pattern or grid pattern)
            mipLevelCount: 1, // How many mip levels the texture has (1 for no mipmapping)
            baseArrayLayer: 0, // The base array layer of the texture (0 for no array layers) an array layer is a slice of a texture that can be used for 3D textures or texture arrays.
            arrayLayerCount: 1, // The number of array layers in the texture (1 for no array layers)
        }
    );

    const renderPassDescriptor : GPURenderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            clearValue: [0.0, 0.0, 0.0, .7],
            loadOp: "clear", // Clear the canvas before rendering
            storeOp: "store" // Store the rendered image in the canvas
        }]
    };

    // Begin a render pass
    // A render pass is a collection of commands that will be executed by the GPU to render graphics.
    const passEncoder : GPURenderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline); // Set the pipeline to use for rendering
    passEncoder.draw(3, 1, 0, 0); // Draw a triangle (3 vertices) (1 instance)
    passEncoder.end(); // End the render pass, this will execute the commands recorded in the pass encoder.

    // Submit the commands to the GPU for execution
    device.queue.submit([commandEncoder.finish()]);




