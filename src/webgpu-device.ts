
// This is a singleton of things that are commonly used throughout the whole project
// Neither the device nor adapter should need multiple instances to be made as this isnt made to handle multiple GPU's

class WebGPUDevice {
    private static _instance: WebGPUDevice;
    private _device: GPUDevice | null = null;
    private _adapter: GPUAdapter | null = null;
    private _canvas: HTMLCanvasElement;
    private _windowDimensions = { width: 0, height: 0 };

    static getInstance(): WebGPUDevice {
        if (!WebGPUDevice._instance) {
            WebGPUDevice._instance = new WebGPUDevice();
        }
        return WebGPUDevice._instance;
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

    get canvas(): HTMLCanvasElement {
        if (!this._canvas) throw new Error('Canvas not initialized');
        return this._canvas;
    }

    get adapter(): GPUAdapter {
        if (!this._adapter) throw new Error('Adapter not initialized');
        return this._adapter;
    }
}

export const WebGPUSingleton = WebGPUDevice.getInstance();