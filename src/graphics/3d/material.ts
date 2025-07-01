import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";



export class Material {
    static default: Material;

    get bindGroup(): GPUBindGroup {
        return this._bindGroup;
    }
    get view(): GPUTextureView {
        return this._view;
    }
    get imageFile(): File {
        return this._imageFile;
    }
    async setImageFile(value: File) {
        this._imageFile = value;
        await this.initialize();
    }

    get imageBitmap(): ImageBitmap {
        return this._imageBitmap;
    }

    private _texture: GPUTexture;
    private _view: GPUTextureView;
    private _sampler: GPUSampler;
    private _bindGroup: GPUBindGroup;
    private _imageFile: File;
    private _imageBitmap: ImageBitmap;


    async initialize() {
        const imageBitmap = await createImageBitmap(this._imageFile)
        this._imageBitmap = imageBitmap;

        const textureDescriptor : GPUTextureDescriptor = {
            size: {
                width: imageBitmap.width,
                height: imageBitmap.height,
            },

            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this._texture = $WGPU.device.createTexture(textureDescriptor);

        this.loadImageBitmap( imageBitmap, 0);

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: navigator.gpu.getPreferredCanvasFormat(),
            aspect: "all",
            dimension: "2d",
        }
        this._view = this._texture.createView(viewDescriptor);

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
                    resource: this._view
                },
                {
                    binding: 1,
                    resource: this._sampler
                }
            ]
        })

    }


   loadImageBitmap( imageBitmap: ImageBitmap, mipLevel: number) {

        $WGPU.device.queue.copyExternalImageToTexture(
            {source: imageBitmap},
            {
                texture: this._texture,
                mipLevel: mipLevel
            },
            {width: imageBitmap.width, height: imageBitmap.height}

        )
    }



}