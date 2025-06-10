
// This is a singleton of things that are commonly used throughout the whole project
// Neither the device nor adapter should need multiple instances to be made as this isnt made to handle multiple GPU's

class WebGPUDevice {
    private static _instance: WebGPUDevice;
    private _device: GPUDevice | null = null;
    private _adapter: GPUAdapter | null = null;

    static getInstance(): WebGPUDevice {
        if (!WebGPUDevice._instance) {
            WebGPUDevice._instance = new WebGPUDevice();
        }
        return WebGPUDevice._instance;
    }

    async initialize(): Promise<void> {
        if (this._device) return;

        this._adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
        this._device = await this._adapter.requestDevice();
    }

    get device(): GPUDevice {
        if (!this._device) throw new Error('Device not initialized');
        return this._device;
    }

    get adapter(): GPUAdapter {
        if (!this._adapter) throw new Error('Adapter not initialized');
        return this._adapter;
    }
}

export const WebGPUSingleton = WebGPUDevice.getInstance();