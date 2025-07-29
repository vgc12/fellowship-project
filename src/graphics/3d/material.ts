import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";




export class Material {
    get sampler(): GPUSampler {
        return this._sampler;
    }


    get normalFile(): File {
        return this._normalFile;
    }

    set normalFile(value: File) {
        this._normalFile = value;
    }

    static async getFile(url : string): Promise<File> {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], url.split('/').pop() || 'default_albedo.png');
    }

    private _roughnessMetallicAOView: GPUTextureView;

    get aoFile(): File {
        return this._aoFile;
    }

    set aoFile(value: File) {
        this._aoFile = value;
    }

    get roughnessFile(): File {
        return this._roughnessFile;
    }

    set roughnessFile(value: File) {
        this._roughnessFile = value;
    }

    get metallicFile(): File {
        return this._metallicFile;
    }

    set metallicFile(value: File) {
        this._metallicFile = value;
    }

    static default: Material;

    get bindGroup(): GPUBindGroup {
        return this._bindGroup;
    }

    get albedoView(): GPUTextureView {
        return this._albedoView;
    }

    get albedoFile(): File {
        return this._albedoFile;
    }

    set albedoFile(value: File) {
        this._albedoFile = value;
    }
    
    


    private _albedoTexture: GPUTexture;
    private _normalTexture: GPUTexture;
    private _roughnessMetallicAOTexture: GPUTexture;
    private _albedoView: GPUTextureView;
    private _normalView: GPUTextureView;
    private _sampler: GPUSampler;
    private _bindGroup: GPUBindGroup;
    private _albedoFile: File;

    private _metallicFile: File;
    private _roughnessFile: File;
    private _aoFile: File;
    private _normalFile: File;

    imageBitmapToImageData(imageBitmap: ImageBitmap): ImageData {
        const offscreenCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        ctx.drawImage(imageBitmap, 0, 0);
        return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    }

    packTextures(metallicData: ImageData, roughnessData: ImageData, aoData: ImageData) {

        const width = metallicData.width;
        const height = metallicData.height;
        const packedData = new Uint8ClampedArray(width * height * 4);

        for (let i = 0; i < width * height; i++) {
            const o = i * 4;
            packedData[o] = roughnessData.data[o];   // R channel (roughness)
            packedData[o + 1] = metallicData.data[o];     // G channel (metallic)
            packedData[o + 2] = aoData.data[o];          // B channel (AO)
            packedData[o + 3] = 255                      // A channel
        }


        return new ImageData(packedData, width, height);
    }

    async initialize() {
        const albedoImageBitmap = await createImageBitmap(this._albedoFile)
        const roughnessImageBitmap = await createImageBitmap(this._roughnessFile);
        const metallicImageBitmap = await createImageBitmap(this._metallicFile);
        const aoImageBitmap = await createImageBitmap(this._aoFile);
        const normalImageBitmap = await createImageBitmap(this._normalFile);

        const roughnessData = this.imageBitmapToImageData(roughnessImageBitmap);
        const metallicData = this.imageBitmapToImageData(metallicImageBitmap);
        const aoData = this.imageBitmapToImageData(aoImageBitmap);

        const roughnessMetallicAO = await createImageBitmap(this.packTextures(metallicData, roughnessData, aoData));


        const albedoTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: albedoImageBitmap.width,
                height: albedoImageBitmap.height,
            },

            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        const normalTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: normalImageBitmap.width,
                height: normalImageBitmap.height,
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,

        }


        const roughnessMetallicAOTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: roughnessMetallicAO.width,
                height: roughnessMetallicAO.height,
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this._albedoTexture = $WGPU.device.createTexture(albedoTextureDescriptor);
        this._normalTexture = $WGPU.device.createTexture(normalTextureDescriptor);
        this._roughnessMetallicAOTexture = $WGPU.device.createTexture(roughnessMetallicAOTextureDescriptor);

        this.loadImageBitmap(albedoImageBitmap, this._albedoTexture, 0);
        this.loadImageBitmap(normalImageBitmap, this._normalTexture, 0);
        this.loadImageBitmap(roughnessMetallicAO, this._roughnessMetallicAOTexture, 0);

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: navigator.gpu.getPreferredCanvasFormat(),
            aspect: "all",
            dimension: "2d",
        }
        this._albedoView = this._albedoTexture.createView(viewDescriptor);
        this._normalView = this._normalTexture.createView(viewDescriptor);
        this._roughnessMetallicAOView = this._roughnessMetallicAOTexture.createView(viewDescriptor);
        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "mirror-repeat",
            addressModeV: "mirror-repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            maxAnisotropy: 16
        }

        this._sampler = $WGPU.device.createSampler(samplerDescriptor);

        this._bindGroup = $WGPU.device.createBindGroup({
            layout: $WGPU.textureBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this._albedoView
                },
                {
                    binding: 1,
                    resource: this._normalView
                },
                {
                    binding: 2,
                    resource: this._roughnessMetallicAOView
                },
                {
                    binding: 3,
                    resource: this._sampler
                }
            ]
        })

    }


    loadImageBitmap(imageBitmap: ImageBitmap, texture: GPUTexture, mipLevel: number) {

        $WGPU.device.queue.copyExternalImageToTexture(
            {source: imageBitmap},
            {
                texture: texture,
                mipLevel: mipLevel
            },
            {width: imageBitmap.width, height: imageBitmap.height}
        )
    }


    async refresh() {
        await this.initialize();
    }
}