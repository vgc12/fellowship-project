import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";

export class SkyMaterial {
    static default: SkyMaterial;
    texture: GPUTexture;
    view: GPUTextureView;
    sampler: GPUSampler;

    async initialize(urls: string[]) {
        var imageData: ImageBitmap[] = new Array(6);

        for (let i = 0; i < urls.length; i++) {
            const response = await fetch(urls[i]);
            const blob = await response.blob();
            imageData[i] = await createImageBitmap(blob);
        }

        await this.loadImageBitmaps($WGPU.device, imageData);

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: navigator.gpu.getPreferredCanvasFormat(),
            aspect: "all",
            dimension: "cube",
            baseMipLevel: 0,
            baseArrayLayer: 0,
            mipLevelCount: 1,
            arrayLayerCount: 6,
        }
        this.view = this.texture.createView(viewDescriptor);

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "nearest",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        };
        this.sampler = $WGPU.device.createSampler(samplerDescriptor);

    }

    createMipMaps() {

    }

    private async loadImageBitmaps(device: GPUDevice, imageData: ImageBitmap[]) {
        const textureDescriptor: GPUTextureDescriptor = {
            label: 'something',
            size: {
                width: imageData[0].width,
                height: imageData[0].height,
                depthOrArrayLayers: 6
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this.texture = device.createTexture(textureDescriptor);

        for (let i = 0; i < imageData.length; i++) {
            const imageBitmap = imageData[i];

            device.queue.copyExternalImageToTexture(
                {source: imageBitmap},
                {texture: this.texture, origin: [0, 0, i]},
                [imageData[i].width, imageData[i].height]
            )
        }
    }
}