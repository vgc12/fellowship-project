// This is a singleton of things that are commonly used throughout the whole project
// Neither the device nor adapter should need multiple instances to be made as this isnt made to handle multiple GPU's

import {Camera} from "@/scene/Camera.ts";


import {CameraController} from "@/Controls/camera-controller.ts";
import {Renderer} from "@/core/renderer/renderer.ts";
import {SkyMaterial} from "@/graphics/3d/sky-material.ts";
import {Material} from "@/graphics/3d/material.ts";
import {fileFromURL} from "@/lib/utils.ts";


class WebGPUSingleton {
    private static _instance: WebGPUSingleton;

    static get Instance(): WebGPUSingleton {
        if (!this._instance) {
            this._instance = new WebGPUSingleton();

        }
        return this._instance;
    }

    private _lightBindGroupLayout: GPUBindGroupLayout;

    get lightBindGroupLayout(): GPUBindGroupLayout {
        return this._lightBindGroupLayout;
    }

    private _device: GPUDevice | null = null;

    get device(): GPUDevice {
        if (!this._device) throw new Error('Device not initialized');
        return this._device;
    }

    private _adapter: GPUAdapter | null = null;

    get adapter(): GPUAdapter {
        if (!this._adapter) throw new Error('Adapter not initialized');
        return this._adapter;
    }

    private _canvas: HTMLCanvasElement;

    get canvas(): HTMLCanvasElement {
        if (!this._canvas) throw new Error('Canvas not initialized');
        return this._canvas;
    }

    private _windowDimensions = {width: 0, height: 0};

    get windowDimensions() {
        if (!this._windowDimensions) {
            throw new Error('Window dimensions not initialized');
        }
        return this._windowDimensions;
    }

    private _mainCamera: Camera | null = null;

    get mainCamera(): Camera {
        if (!this._mainCamera) throw new Error('Camera not initialized');
        return this._mainCamera;
    }

    private _cameraController: CameraController;

    get cameraController(): CameraController {
        return this._cameraController;
    }

    private _vertexBufferLayout: GPUVertexBufferLayout | null = null;

    get vertexBufferLayout(): GPUVertexBufferLayout | null {
        return this._vertexBufferLayout;
    }

    private _format: GPUTextureFormat;

    get format(): GPUTextureFormat {
        return this._format;
    }

    private _context: GPUCanvasContext;

    get context(): GPUCanvasContext {
        return this._context;
    }

    /* texture bind group layout is located here because then i dont have to supply the layout
       while creating a material in the react texture-input-component.
     */
    private _textureBindGroupLayout: GPUBindGroupLayout;

    get textureBindGroupLayout(): GPUBindGroupLayout {
        return this._textureBindGroupLayout;
    }

    /*
        this is here now for consistency, if im going to have the other bind group layout here I might as well
        put this one here.
     */
    private _frameBindGroupLayout: GPUBindGroupLayout;

    get frameBindGroupLayout(): GPUBindGroupLayout {
        return this._frameBindGroupLayout;
    }

    // I hate this
    private _gBufferBindGroupLayout: GPUBindGroupLayout;

    get gBufferBindGroupLayout(): GPUBindGroupLayout {
        return this._gBufferBindGroupLayout;
    }

    // and this
    private _skyBindGroupLayout: GPUBindGroupLayout;

    get skyBindGroupLayout(): GPUBindGroupLayout {
        return this._skyBindGroupLayout;
    }

    private _renderer = new Renderer();

    get renderer(): Renderer {
        return this._renderer;
    }

    async initializeDefaultSkyMaterial() {
        const path = '/media/defaults/sky-material/';
        const urls = [
            path + "px.png",  //x+
            path + "nx.png",   //x-
            path + "py.png",   //y+
            path + "ny.png",  //y-
            path + "pz.png", //z+
            path + "nz.png",    //z-
        ]

        SkyMaterial.default = new SkyMaterial();

        await SkyMaterial.default.initialize(urls);
    }

    async initializeDefaultMaterial() {
        const path = '/media/defaults/material/'
        Material.default = new Material();
        Material.default.albedoFile = await fileFromURL(path + 'default_albedo.png');
        Material.default.roughnessFile = await fileFromURL(path + 'default_roughness.png');
        Material.default.metallicFile = await fileFromURL(path + 'default_metallic.png');
        Material.default.normalFile = await fileFromURL(path + 'default_normal.png');
        Material.default.emissiveFile = await fileFromURL(path + 'default_emissive.png');
        await Material.default.initialize();
    }


    async initialize(): Promise<void> {
        if (this._device) return;
        await this.createWebGPURequirements();

        this.createSceneObjects();


        this.createVertexBufferLayout();

        this.initializeBindGroupLayouts();
        await this.initializeDefaultMaterial();

        await this._renderer.initialize();
        await this.initializeDefaultSkyMaterial();
    }

    private initializeBindGroupLayouts() {
        this.createTextureBindGroupLayout();
        this.createFrameBindGroupLayout();
        this.createLightBindGroupLayout();
        this.createGBufferBindGroupLayout();
        this.createSkyBindGroupLayout();
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
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
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
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT, // emissive
                    texture: {sampleType: 'float'}
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
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
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
            alphaMode: 'opaque',
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


}


// A singleton that contains several common objects that are used throughout the project.
export const $WGPU = WebGPUSingleton.Instance;