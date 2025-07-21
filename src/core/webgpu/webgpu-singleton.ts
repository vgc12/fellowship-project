// This is a singleton of things that are commonly used throughout the whole project
// Neither the device nor adapter should need multiple instances to be made as this isnt made to handle multiple GPU's

import {Camera} from "@/scene/Camera.ts";

import {type RenderableObject} from "@/scene/renderable-object.ts";
import type {IObject} from "@/scene/IObject.ts";

import {CameraController} from "@/Controls/camera-controller.ts";
import {Light} from "@/scene/point-light.ts";


class WebGPUSingleton {
    get lightShadowInformationBindGroups(): Map<string, GPUBindGroup> {
        return this._lightShadowInformationBindGroups;
    }

    set lightShadowInformationBindGroups(value: Map<string, GPUBindGroup>) {
        this._lightShadowInformationBindGroups = value;
    }


    get shadowDepthTextures(): Map<string, GPUTexture> {
        return this._shadowDepthTextures;
    }

    shadowInformationBindGroupLayout: GPUBindGroupLayout;

    get shadowBindGroupLayout(): GPUBindGroupLayout {
        return this._shadowBindGroupLayout;
    }

    get skyBindGroupLayout(): GPUBindGroupLayout {
        return this._skyBindGroupLayout;
    }

    get gBufferBindGroupLayout(): GPUBindGroupLayout {
        return this._gBufferBindGroupLayout;
    }

    get lightBindGroupLayout(): GPUBindGroupLayout {
        return this._lightBindGroupLayout;
    }


    get lights() {
        return this._lights;
    }

    addLight(light: Light) {
        this.createShadowCubeMap(light);
        this.setUpShadowBindGroup(light)
        this._lights.push(light);
    }

    get cameraController(): CameraController {
        return this._cameraController;
    }

    get textureBindGroupLayout(): GPUBindGroupLayout {
        return this._textureBindGroupLayout;
    }

    get frameBindGroupLayout(): GPUBindGroupLayout {
        return this._frameBindGroupLayout;
    }

    private static _instance: WebGPUSingleton;
    private _device: GPUDevice | null = null;
    private _adapter: GPUAdapter | null = null;
    private _canvas: HTMLCanvasElement;
    private _windowDimensions = {width: 0, height: 0};
    private _renderableObjects: RenderableObject[] = [];
    private _objects: IObject[] = [];

    private _mainCamera: Camera | null = null;
    private _cameraController: CameraController;
    private _vertexBufferLayout: GPUVertexBufferLayout | null = null;
    private _format: GPUTextureFormat;
    private _context: GPUCanvasContext;
    /* texture bind group layout is located here because then i dont have to supply the layout
       while creating a material in the react texture-input-component.
     */
    private _textureBindGroupLayout: GPUBindGroupLayout;
    /*
        this is here now for consistency, if im going to have the other bind group layout here I might as well
        put this one here.
     */
    private _frameBindGroupLayout: GPUBindGroupLayout;
    // I hate this
    private _gBufferBindGroupLayout: GPUBindGroupLayout;
    // and this
    private _skyBindGroupLayout: GPUBindGroupLayout;

    private _lightBindGroupLayout: GPUBindGroupLayout;

    private _shadowBindGroupLayout: GPUBindGroupLayout;

    private _shadowDepthTextures: Map<string, GPUTexture> = new Map();
    private _lightShadowInformationBindGroups: Map<string, GPUBindGroup> = new Map();

    private shadowMapSize: number = 1024;

    private _lights: Light[];

    private createShadowCubeMap(light: Light) {


        const shadowDepthTexture = $WGPU.device.createTexture({
            label: `Shadow Depth Texture ${light.guid}`,
            size: [this.shadowMapSize, this.shadowMapSize, 6],
            format: 'depth32float',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d'
        });

        this._shadowDepthTextures.set(light.guid, shadowDepthTexture);

    }

    static get Instance(): WebGPUSingleton {
        if (!this._instance) {
            this._instance = new WebGPUSingleton();

        }
        return this._instance;
    }


    get format(): GPUTextureFormat {
        return this._format;
    }

    get context(): GPUCanvasContext {
        return this._context;
    }

    get vertexBufferLayout(): GPUVertexBufferLayout | null {
        return this._vertexBufferLayout;
    }

    addObject(object: IObject) {
        this._objects.push(object);
    }

    get objects(): IObject[] {
        return this._objects;
    }


    get device(): GPUDevice {
        if (!this._device) throw new Error('Device not initialized');
        return this._device;
    }

    get windowDimensions() {
        if (!this._windowDimensions) {
            throw new Error('Window dimensions not initialized');
        }
        return this._windowDimensions;
    }

    get mainCamera(): Camera {
        if (!this._mainCamera) throw new Error('Camera not initialized');
        return this._mainCamera;
    }

    get canvas(): HTMLCanvasElement {
        if (!this._canvas) throw new Error('Canvas not initialized');
        return this._canvas;
    }

    get adapter(): GPUAdapter {
        if (!this._adapter) throw new Error('Adapter not initialized');
        return this._adapter;
    }

    get renderableObjects(): RenderableObject[] {
        return this._renderableObjects;
    }

    async initialize(): Promise<void> {
        if (this._device) return;
        await this.createWebGPURequirements();

        this.createSceneObjects();


        this.createVertexBufferLayout();

        this.initializeBindGroupLayouts();

    }

    private initializeBindGroupLayouts() {
        this.createTextureBindGroupLayout();
        this.createFrameBindGroupLayout();
        this.createLightBindGroupLayout();
        this.createGBufferBindGroupLayout();
        this.createSkyBindGroupLayout();
        this.createShadowBindGroupLayout();
        this.createShadowInformationBindGroupLayout();
    }

    createShadowInformationBindGroupLayout() {
        this.shadowInformationBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label: "Shadow Information Bind Group Layout",
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {
                    viewDimension: "cube",
                    sampleType: 'depth'
                },
            },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: 'non-filtering'
                    }
                }]
        })
    }


    setUpShadowBindGroup(light: Light) {

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: "depth32float",
            aspect: "all",
            dimension: "cube",
            baseMipLevel: 0,
            baseArrayLayer: 0,
            mipLevelCount: 1,
            arrayLayerCount: 6,
        }
        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
        };
        const sampler = $WGPU.device.createSampler(samplerDescriptor)

        const bindGroup = $WGPU.device.createBindGroup({
            layout: this.shadowInformationBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: (this.shadowDepthTextures.get(light.guid) as GPUTexture).createView(viewDescriptor)
                },
                {
                    binding: 1,
                    resource: sampler
                }


            ]
        })
        this._lightShadowInformationBindGroups.set(light.guid, bindGroup);
        //this.lightShadowInformationBindGroups.
    }

    private createShadowBindGroupLayout() {
        this._shadowBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label: "Shadow Bind Group Layout",
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform"
                }
            },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage',
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                }


            ]
        })
    }

    private createLightBindGroupLayout() {
        this._lightBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label: 'Light Bind Group Layout',
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'read-only-storage',
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform',
                        hasDynamicOffset: false
                    }
                }
            ]

        });
    }

    private createFrameBindGroupLayout() {
        this._frameBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label: 'Frame Bind Group Layout',
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {}
            },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage',
                        hasDynamicOffset: false
                    }
                }

            ]
        })
    }

    private createTextureBindGroupLayout() {
        this._textureBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label: 'Texture Bind Group Layout',
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                }
            ]
        })
    }

    private createGBufferBindGroupLayout() {

        this._gBufferBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label: "G-Buffer Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT, // albedo
                    texture: {sampleType: 'float'}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT, // normal
                    texture: {sampleType: 'float'}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT, // metallicRoughnessAO
                    texture: {sampleType: 'float'}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT, // position
                    texture: {sampleType: 'unfilterable-float'}
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,  // depth
                    texture: {sampleType: 'depth'}
                }

            ]
        });

    }

    private createSkyBindGroupLayout() {
        this._skyBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label: "Sky Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'uniform',
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'float',
                        viewDimension: 'cube'
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                }
            ]
        })
    }

    private async createWebGPURequirements() {
        // Request a GPU adapter and device
        // An adapter is a link between the browser and the GPU hardware.
        // Allows for getting information about the GPU and creating a device to interact with it.
        this._canvas = document.getElementById('canvas-main') as HTMLCanvasElement;
        // this._canvas =  document.createElement('canvas');
        //this._canvas = canvas as HTMLCanvasElement;
        this._windowDimensions = {
            width: this._canvas.width,
            height: this._canvas.height
        }

        this._lights = [];
        this._adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
        this._device = await this._adapter.requestDevice({
            requiredLimits: {
                maxColorAttachmentBytesPerSample: 64
            }
        });
        this._context = this.canvas.getContext('webgpu') as GPUCanvasContext;
        this._format = navigator.gpu.getPreferredCanvasFormat();

        this._context.configure({
            format: this.format,
            device: $WGPU.device,
            alphaMode: 'premultiplied',
        });
    }

    private createSceneObjects() {
        this._mainCamera = new Camera();
        this._mainCamera.name = "Camera";
        this._mainCamera.transform.position.set(0, 0, -5)


        this._cameraController = new CameraController(this._mainCamera);
    }

    private createVertexBufferLayout() {
        this._vertexBufferLayout = {
            arrayStride: 56,
            attributes: [
                {
                    shaderLocation: 0,
                    format: 'float32x3',
                    offset: 0,
                },
                {
                    shaderLocation: 1,
                    format: 'float32x2',
                    offset: 12
                },
                {
                    shaderLocation: 2,
                    format: 'float32x3',
                    offset: 20
                },
                {
                    shaderLocation: 3,
                    format: 'float32x3',
                    offset: 32
                },
                {
                    shaderLocation: 4,
                    format: 'float32x3',
                    offset: 44
                }
            ]
        }
    }

    addRenderableObject(object: RenderableObject) {
        this._renderableObjects.push(object);

    }


}

// A singleton that contains several common objects that are used throughout the project.
export const $WGPU = WebGPUSingleton.Instance;