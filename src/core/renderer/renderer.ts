import deferredVertexShader from '../../graphics/shaders/geometry.vert.wgsl';
import deferredFragmentShader from '../../graphics/shaders/geometry.frag.wgsl';
import lightingVertexShader from '../../graphics/shaders/light.vert.wgsl';
import lightingFragmentShader from '../../graphics/shaders/light.frag.wgsl';
import skyVertexShader from '../../graphics/shaders/sky.vert.wgsl';
import skyFragmentShader from '../../graphics/shaders/sky.frag.wgsl';

import {$WGPU} from '../webgpu/webgpu-singleton.ts';
import {ShaderBuilder} from "@/graphics/shader-utils/shader-builder.ts";
import {Light, lightType} from "@/scene/point-light.ts";
import type {SpotLight} from "@/scene/spot-light.ts";
import {SkyMaterial} from "@/graphics/3d/sky-material.ts";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";

export class Renderer {

    gBufferTextures: {
        albedo: GPUTexture;
        normal: GPUTexture;
        metallicRoughnessAO: GPUTexture;
        position: GPUTexture;
        depth: GPUTexture;
    };


    gBufferViews: {
        albedo: GPUTextureView;
        normal: GPUTextureView;
        metallicRoughnessAO: GPUTextureView;
        position: GPUTextureView;
        depth: GPUTextureView;
    }


    geometryPipeline: GPURenderPipeline;
    lightingPipeline: GPURenderPipeline;
    skyPipeline: GPURenderPipeline;


    objectUniformBuffer: GPUBuffer;
    frameBindGroup: GPUBindGroup;
    gBufferBindGroup: GPUBindGroup;
    skyBindGroup: GPUBindGroup;

    objectStorageBuffer: GPUBuffer;
    lightStorageBuffer: GPUBuffer;
    lightBindGroup: GPUBindGroup;
    lightUniformBuffer: GPUBuffer;
    cameraBuffer: GPUBuffer;
    modelMatrices: Float32Array;


    fullscreenVertexBuffer: GPUBuffer;


    commandEncoder: GPUCommandEncoder;
    geometryPassEncoder: GPURenderPassEncoder;
    lightingPassEncoder: GPURenderPassEncoder;
    skyPassEncoder: GPURenderPassEncoder;


    async initialize() {
        if (!navigator.gpu) {
            console.error('WebGPU is not supported. Please enable it in your browser settings.');
            return;
        }

        this.modelMatrices = new Float32Array(16 * 1024);

        await this.setupGBuffer();
        await this.setupBuffers();
        await this.setupBindGroups();
        await this.setupPipelines();

    }

    private async setupGBuffer() {
        const windowDimensions = $WGPU.windowDimensions;

        // Create G-Buffer textures
        // This is where data is stored after the geometry pass
        this.gBufferTextures = {
            albedo: $WGPU.device.createTexture({
                size: windowDimensions,
                format: 'rgba8unorm-srgb',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            }),
            normal: $WGPU.device.createTexture({
                size: windowDimensions,
                format: 'rgba16float',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            }),
            metallicRoughnessAO: $WGPU.device.createTexture({
                size: windowDimensions,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            }),
            position: $WGPU.device.createTexture({
                size: windowDimensions,
                format: 'rgba32float',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            }),
            depth: $WGPU.device.createTexture({
                size: windowDimensions,
                format: 'depth32float',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            })
        };

        // Create texture views
        this.gBufferViews = {
            albedo: this.gBufferTextures.albedo.createView(),
            position: this.gBufferTextures.position.createView(),
            normal: this.gBufferTextures.normal.createView(),
            metallicRoughnessAO: this.gBufferTextures.metallicRoughnessAO.createView(),
            depth: this.gBufferTextures.depth.createView()
        };
    }

    private async setupBuffers() {
        // Buffer for storing view, projection matrices and camera position
        this.objectUniformBuffer = $WGPU.device.createBuffer({
            label: "uniform buffer",
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: (64 * 3) + (4 * 4)
        });
        // Buffer where model matrices are stored
        this.objectStorageBuffer = $WGPU.device.createBuffer({
            label: "storage buffer",
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            size: 64 * 1024
        });
        // Buffer where data for lights is stored
        this.lightStorageBuffer = $WGPU.device.createBuffer({
            label: "light storage buffer",
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            size: 24 * 64
        });
        // Get rid of this buffer
        this.lightUniformBuffer = $WGPU.device.createBuffer({
            label: "light uniform buffer",
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: 4
        });
        this.cameraBuffer = $WGPU.device.createBuffer({
            label: "camera buffer",
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: 4 * 4 * 3
        });
    }

    private async setupBindGroups() {
        // Bind group for frame data (camera matrices, model matrices)
        this.frameBindGroup = $WGPU.device.createBindGroup({
            label: "Frame Bind Group",
            layout: $WGPU.frameBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {buffer: this.objectUniformBuffer}
                },
                {
                    binding: 1,
                    resource: {buffer: this.objectStorageBuffer}
                }
            ]
        });
        // Bind group for lights
        this.lightBindGroup = $WGPU.device.createBindGroup({
            layout: $WGPU.lightBindGroupLayout,
            label: "Light Bind Group",
            entries: [
                {
                    binding: 0,
                    resource: {buffer: this.lightStorageBuffer}
                },
                {
                    binding: 1,
                    resource: {buffer: this.lightUniformBuffer}
                }
            ]
        });


        this.gBufferBindGroup = $WGPU.device.createBindGroup({
            layout: $WGPU.gBufferBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.gBufferViews.albedo
                },
                {
                    binding: 1,
                    resource: this.gBufferViews.normal
                },
                {
                    binding: 2,
                    resource: this.gBufferViews.metallicRoughnessAO
                },
                {
                    binding: 3,
                    resource: this.gBufferViews.position
                },
                {
                    binding: 4,
                    resource: this.gBufferViews.depth
                }

            ]
        });

        const urls = [
            "img/sky/px.png",  //x+
            "img/sky/nx.png",   //x-
            "img/sky/py.png",   //y+
            "img/sky/ny.png",  //y-
            "img/sky/pz.png", //z+
            "img/sky/nz.png",    //z-
        ]

        SkyMaterial.default = new SkyMaterial();
        await SkyMaterial.default.initialize(urls);

        this.skyBindGroup = $WGPU.device.createBindGroup({
            layout: $WGPU.skyBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {buffer: this.cameraBuffer}
                },
                {
                    binding: 1,
                    resource: SkyMaterial.default.view,
                },
                {
                    binding: 2,
                    resource: SkyMaterial.default.sampler
                }
            ]
        })
    }

    private async setupPipelines() {
        const shaderBuilder = new ShaderBuilder();

        const ShaderEntryPoint = 'main' as const; // the name of the main function in all shaders

        // Geometry pass pipeline (writes to G-Buffer)
        const geometryShader = shaderBuilder
            .setVertexCode(deferredVertexShader, ShaderEntryPoint)
            .addVertexBufferLayout($WGPU.vertexBufferLayout as GPUVertexBufferLayout)
            .setFragmentCode(deferredFragmentShader, ShaderEntryPoint)
            .addColorFormat('rgba8unorm-srgb')
            .addColorFormat('rgba16float')
            .addColorFormat('rgba8unorm')
            .addColorFormat('rgba32float')
            .build();

        const geometryPipelineLayout = $WGPU.device.createPipelineLayout({
            label: "Geometry Pipeline Layout",
            bindGroupLayouts: [$WGPU.frameBindGroupLayout, $WGPU.textureBindGroupLayout]
        });

        this.geometryPipeline = await $WGPU.device.createRenderPipelineAsync({
            label: "Geometry Pipeline",
            vertex: geometryShader.vertexState,
            fragment: geometryShader.fragmentState,
            layout: geometryPipelineLayout,
            primitive: {topology: 'triangle-list'},
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth32float"
            }
        });


        const lightingShader = shaderBuilder
            .setVertexCode(lightingVertexShader, ShaderEntryPoint)
            .setFragmentCode(lightingFragmentShader, ShaderEntryPoint)
            .addColorFormat($WGPU.format)
            .build();


        const lightingPipelineLayout = $WGPU.device.createPipelineLayout({
            label: "Lighting Pipeline Layout",
            bindGroupLayouts: [
                $WGPU.frameBindGroupLayout,
                $WGPU.gBufferBindGroupLayout,
                $WGPU.lightBindGroupLayout,
                $WGPU.skyBindGroupLayout,
            ]
        });

        this.lightingPipeline = await $WGPU.device.createRenderPipelineAsync({
            label: "Lighting Pipeline",
            vertex: lightingShader.vertexState,
            fragment: lightingShader.fragmentState,
            layout: lightingPipelineLayout,
            primitive: {topology: 'triangle-list'}
        });


        const skyShader = shaderBuilder
            .setVertexCode(skyVertexShader, ShaderEntryPoint)
            .setFragmentCode(skyFragmentShader, ShaderEntryPoint)
            .addColorFormat($WGPU.format)
            .build();

        const skyPipelineLayout = $WGPU.device.createPipelineLayout({
            label: "Sky Pipeline Layout",
            bindGroupLayouts: [$WGPU.skyBindGroupLayout]
        })

        this.skyPipeline = await $WGPU.device.createRenderPipelineAsync({
            label: "Sky Pipeline",
            vertex: skyShader.vertexState,
            fragment: skyShader.fragmentState,
            layout: skyPipelineLayout,
            primitive: {topology: 'triangle-list'},
            depthStencil: {
                depthWriteEnabled: false,
                depthCompare: 'less-equal',
                format: "depth32float"
            }


        })
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

    private writeCameraBuffer() {
        $WGPU.device.queue.writeBuffer(this.cameraBuffer, 0, new Float32Array($WGPU.mainCamera.transform.forward.normalized.toArray) as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.cameraBuffer, 16, new Float32Array($WGPU.mainCamera.transform.right.normalized.toArray) as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.cameraBuffer, 32, new Float32Array($WGPU.mainCamera.transform.up.normalized.toArray) as ArrayBuffer)

    }

    private writeLightBuffer() {
        const lightArray = this.createLightArray();
        $WGPU.device.queue.writeBuffer(this.lightStorageBuffer, 0, lightArray as ArrayBuffer);
        $WGPU.device.queue.writeBuffer(this.lightUniformBuffer, 0, new Int32Array([$SCENE_MANAGER.currentScene.lights.length]));
    }

    private createModelMatrixArray() {
        for (let renderableIndex = 0; renderableIndex < $SCENE_MANAGER.currentScene.renderableObjects.length; renderableIndex++) {
            const renderable = $SCENE_MANAGER.currentScene.renderableObjects[renderableIndex];
            for (let MATRIX_POSITION = 0; MATRIX_POSITION < renderable.modelMatrix.length; MATRIX_POSITION++) {
                this.modelMatrices[16 * renderableIndex + MATRIX_POSITION] = renderable.modelMatrix[MATRIX_POSITION];
            }
        }
        return this.modelMatrices;
    }

    private createLightArray() {
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
        } as const;

        const lights = $SCENE_MANAGER.currentScene.lights;
        const lightArray = new Float32Array(LIGHT_STRIDE * lights.length);

        function setVector(vector: number[], offset: number, padding: number = 0) {
            for (let i = 0; i < vector.length; i++) {
                lightArray[offset + i] = vector[i];
            }
            for (let i = 0; i < padding; i++) {
                lightArray[offset + vector.length + i] = 0;
            }
        }

        function setLightParams(offset: number, light: Light) {
            lightArray.fill(0, offset, offset + 4);
            if (light.lightType === lightType.SPOT) {
                const l = light as SpotLight;
                lightArray[offset] = l.innerAngleRadians;
                lightArray[offset + 1] = l.outerAngleRadians;
            }
        }

        lights.forEach((light, i) => {
            const offset = i * LIGHT_STRIDE;
            setVector(light.transform.position.toArray, offset + OFFSETS.POSITION);
            lightArray[offset + OFFSETS.INTENSITY] = light.intensity;
            setVector(light.color.toArray, offset + OFFSETS.COLOR);
            lightArray[offset + OFFSETS.LIGHT_TYPE] = light.lightType;
            setLightParams(offset + OFFSETS.LIGHT_PARAMS, light);

            const structPadding = 1;
            setVector(light.transform.up.toArray, offset + OFFSETS.UP_VECTOR, structPadding);
            setVector(light.transform.right.toArray, offset + OFFSETS.RIGHT_VECTOR, structPadding);
            setVector(light.transform.forward.toArray, offset + OFFSETS.FORWARD_VECTOR, structPadding);
        });

        return lightArray;
    }

    update() {
        this.writeFrameGroupBuffers();
        this.writeCameraBuffer()
        this.writeLightBuffer();

        this.commandEncoder = $WGPU.device.createCommandEncoder();

        // GEOMETRY PASS - Render to G-Buffer

        this.renderGeometryPass();


        this.renderLightingPass();
        this.renderSkyPass();
        $WGPU.device.queue.submit([this.commandEncoder.finish()]);
    }

    private renderSkyPass() {
        const textureView = $WGPU.context.getCurrentTexture().createView();

        const skyPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: [0.0, 0.0, 0.0, 0.0],
                loadOp: 'load',
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: this.gBufferViews.depth,
                depthLoadOp: 'load',
                depthStoreOp: 'store'
            }

        };

        this.skyPassEncoder = this.commandEncoder.beginRenderPass(skyPassDescriptor);


        this.skyPassEncoder.setPipeline(this.skyPipeline);
        this.skyPassEncoder.setBindGroup(0, this.skyBindGroup);
        // Draw fullscreen quad
        this.skyPassEncoder.setVertexBuffer(0, this.fullscreenVertexBuffer);
        this.skyPassEncoder.draw(6, 1, 0, 0);
        this.skyPassEncoder.end();
    }

    private renderGeometryPass() {
        const geometryPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: this.gBufferViews.albedo, // albedo
                    clearValue: [0, 0, 0, 0],
                    loadOp: 'clear',
                    storeOp: 'store'
                },
                {
                    view: this.gBufferViews.normal, // normal
                    clearValue: [0, 0, 0, 0],
                    loadOp: 'clear',
                    storeOp: 'store'
                },
                {
                    view: this.gBufferViews.metallicRoughnessAO,
                    clearValue: [0, 0, 0, 0],
                    loadOp: 'clear',
                    storeOp: 'store'
                },
                {
                    view: this.gBufferViews.position,
                    clearValue: [0, 0, 0, 0],
                    loadOp: 'clear',
                    storeOp: 'store'
                }
            ],
            depthStencilAttachment: {
                view: this.gBufferViews.depth,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };

        this.geometryPassEncoder = this.commandEncoder.beginRenderPass(geometryPassDescriptor);
        this.geometryPassEncoder.setPipeline(this.geometryPipeline);
        this.geometryPassEncoder.setBindGroup(0, this.frameBindGroup);

        let objectsDrawn = 0;
        $SCENE_MANAGER.currentScene.renderableObjects.forEach((renderable) => {
            this.geometryPassEncoder.setBindGroup(1, renderable.material.bindGroup);

            if (renderable.mesh.indexBuffer && renderable.mesh.indices?.length !== 0) {
                this.geometryPassEncoder.setIndexBuffer(renderable.mesh.indexBuffer, "uint16");
                this.geometryPassEncoder.setVertexBuffer(0, renderable.mesh.vertexBuffer);
                this.geometryPassEncoder.drawIndexed(renderable.mesh.indices?.length ?? 0, 1, 0, 0, objectsDrawn);
            } else {
                this.geometryPassEncoder.setVertexBuffer(0, renderable.mesh.vertexBuffer);
                this.geometryPassEncoder.draw(renderable.mesh.vertexCount, 1, 0, objectsDrawn);
            }
            objectsDrawn++;
        });

        this.geometryPassEncoder.end();
    }

    private renderLightingPass() {
        const textureView = $WGPU.context.getCurrentTexture().createView();

        const lightingPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: [0.6, 0.3, 0.3, 1.0],
                loadOp: 'clear',
                storeOp: 'store'
            }]
        };

        this.lightingPassEncoder = this.commandEncoder.beginRenderPass(lightingPassDescriptor);
        this.lightingPassEncoder.setPipeline(this.lightingPipeline);
        this.lightingPassEncoder.setBindGroup(0, this.frameBindGroup);
        this.lightingPassEncoder.setBindGroup(1, this.gBufferBindGroup);
        this.lightingPassEncoder.setBindGroup(2, this.lightBindGroup);
        this.lightingPassEncoder.setBindGroup(3, this.skyBindGroup);

        // Draw fullscreen quad
        this.lightingPassEncoder.setVertexBuffer(0, this.fullscreenVertexBuffer);
        this.lightingPassEncoder.draw(6, 1, 0, 0);

        this.lightingPassEncoder.end();
    }
}