// This is a singleton of things that are commonly used throughout the whole project
// Neither the device nor adapter should need multiple instances to be made as this isnt made to handle multiple GPU's

import {Camera} from "@/scene/Camera.ts";

import {type RenderableObject} from "@/scene/renderable-object.ts";
import type {IObject} from "@/scene/IObject.ts";

import {CameraController} from "@/Controls/camera-controller.ts";
import {Light} from "@/scene/point-light.ts";

class WebGPUSingleton {
    get lightBindGroupLayout(): GPUBindGroupLayout {
        return this._lightBindGroupLayout;
    }


    private _lightBindGroupLayout: GPUBindGroupLayout;

    private _lights :  Light[];

    get lights() {
        return this._lights;
    }

    addLight (light: Light) {
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
            requiredLimits : {
                maxColorAttachmentBytesPerSample : 64
            }
        });
        this._mainCamera = new Camera();
        this._mainCamera.name = "Camera";
        this._mainCamera.transform.position.set(0, 0, -5)
        this._context = this.canvas.getContext('webgpu') as GPUCanvasContext;

        this._cameraController = new CameraController(this._mainCamera);

        this._format = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            format: this.format,
            device: $WGPU.device,
            alphaMode: 'premultiplied',
        });


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

        this._textureBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label : 'Texture Bind Group Layout',
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

        this._lightBindGroupLayout = $WGPU.device.createBindGroupLayout({
            label : 'Light Bind Group Layout',
            entries: [
                {
                    binding: 0,
                    visibility:  GPUShaderStage.FRAGMENT,
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

    addRenderableObject(object: RenderableObject) {
        this._renderableObjects.push(object);

    }


}

// A singleton that contains several common objects that are used throughout the project.
export const $WGPU = WebGPUSingleton.Instance;