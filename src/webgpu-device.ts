
// This is a singleton of things that are commonly used throughout the whole project
// Neither the device nor adapter should need multiple instances to be made as this isnt made to handle multiple GPU's

import type {IObject} from "./IObject.ts";
import {Camera} from "./Camera.ts";
import type {IRenderable} from "./IRenderable.ts";

class WebGPUSingleton {

    private static _instance: WebGPUSingleton;
    private _device: GPUDevice | null = null;
    private _adapter: GPUAdapter | null = null;
    private _canvas: HTMLCanvasElement;
    private _windowDimensions = { width: 0, height: 0 };
    private _objects: IObject[] = [];
    private _renderables: IRenderable[] = [];
    private _camera: Camera | null = null;

    static getInstance(): WebGPUSingleton {
        if (!WebGPUSingleton._instance) {
            WebGPUSingleton._instance = new WebGPUSingleton();
        }
        return WebGPUSingleton._instance;
    }

    async initialize(): Promise<void> {
        if (this._device) return;
        // Request a GPU adapter and device
        // An adapter is a link between the browser and the GPU hardware.
        // Allows for getting information about the GPU and creating a device to interact with it.
        this._canvas = document.getElementById('canvas-main') as HTMLCanvasElement;
        this._windowDimensions = {
            width: this._canvas.width,
            height: this._canvas.height
        }

        this._adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
        this._device = await this._adapter.requestDevice();
        this._camera = new Camera();
        this._camera.transform.setPosition(0, 0, 0);

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

    get camera(): Camera {
        if (!this._camera) throw new Error('Camera not initialized');
        return this._camera;
    }

    get canvas(): HTMLCanvasElement {
        if (!this._canvas) throw new Error('Canvas not initialized');
        return this._canvas;
    }

    get adapter(): GPUAdapter {
        if (!this._adapter) throw new Error('Adapter not initialized');
        return this._adapter;
    }

    get objects(): IObject[] {
        return this._objects;
    }
    get renderables(): IRenderable[] {
        return this._renderables;
    }
    addObject(object: IObject) {
        this._objects.push(object);
    }

    addRenderable(renderable: IRenderable) {
        this._renderables.push(renderable);
    }
}

// A singleton that contains several common objects that are used throughout the project.
export const $WGPU = WebGPUSingleton.getInstance();