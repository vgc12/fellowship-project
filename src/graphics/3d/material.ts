


export class Material {

    texture: GPUTexture;
    view: GPUTextureView;
    sampler: GPUSampler;
    bindGroup: GPUBindGroup;

    async initialize(file: File, device: GPUDevice, name: string, bindGroupLayout: GPUBindGroupLayout) {



        let mipLevels = 0;

        let width = 0;
        let height = 0;



        while(true){
            const url: string = "dist/img/" + name + "/" + name + "_" + mipLevels.toString() + ".png";
            const response = await fetch(url);


            if(!response.ok){
                break;
            }

            if (mipLevels == 0){
                const blob = await response.blob();
                const imageBitmap = await createImageBitmap(blob);
                width = imageBitmap.width;
                height = imageBitmap.height;
                imageBitmap.close();
            }

            mipLevels++;
        }
        const textureDescriptor : GPUTextureDescriptor = {
            size: {
                width: width,
                height: height,
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this.texture = device.createTexture(textureDescriptor);

        for(let i = 0; i < mipLevels; i++) {
            const url: string = "dist/img/" + name + "/" + name + "_" + i.toString() + ".png";
            const response = await fetch(url);
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);

            await this.loadImageBitmap(device, imageBitmap, i);
            imageBitmap.close();
        }


        const viewDescriptor: GPUTextureViewDescriptor = {
            format: navigator.gpu.getPreferredCanvasFormat(),
            aspect: "all",
            dimension: "2d",
            baseMipLevel: 0,
            baseArrayLayer: 0,
            mipLevelCount: 1,
            arrayLayerCount: 1,
        }
        this.view = this.texture.createView(viewDescriptor);

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            maxAnisotropy: 16
        }

        this.sampler = device.createSampler(samplerDescriptor);

        this.bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.view
                },
                {
                    binding: 1,
                    resource: this.sampler
                }
            ]
        })
    }

    async loadImageBitmap(device: GPUDevice, imageBitmap: ImageBitmap, mipLevel: number) {


        device.queue.copyExternalImageToTexture(
            {source: imageBitmap},
            {
                texture: this.texture,
                mipLevel: mipLevel
            },
            {width: imageBitmap.width, height: imageBitmap.height}

        )
    }



}