import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {fileFromURL, imageExists} from "@/lib/utils.ts";
import {type imageFileType} from "@/components/texture-input.tsx";
import {generateMips, numMipLevels} from "@/graphics/shader-utils/mipmap-generator.ts";


export class Material {
    static default: Material;
    private _roughnessMetallicAOView: GPUTextureView;
    private _albedoTexture: GPUTexture;
    private _normalTexture: GPUTexture;
    private _emissiveTexture: GPUTexture;
    private _roughnessMetallicAOTexture: GPUTexture;
    private _normalView: GPUTextureView;
    private _emissiveView: GPUTextureView;

    private _albedoView: GPUTextureView;

    get albedoView(): GPUTextureView {
        return this._albedoView;
    }

    private _sampler: GPUSampler;

    get sampler(): GPUSampler {
        return this._sampler;
    }

    private _bindGroup: GPUBindGroup;

    get bindGroup(): GPUBindGroup {
        return this._bindGroup;
    }

    private _albedoFile: File;

    get albedoFile(): File {
        return this._albedoFile;
    }

    set albedoFile(value: File) {
        this._albedoFile = value;
    }

    private _aoFile: File;

    get aoFile(): File {
        return this._aoFile;
    }

    set aoFile(value: File) {
        this._aoFile = value;
    }

    private _metallicFile: File;

    get metallicFile(): File {
        return this._metallicFile;
    }

    set metallicFile(value: File) {
        this._metallicFile = value;
    }

    private _roughnessFile: File;

    get roughnessFile(): File {
        return this._roughnessFile;
    }

    set roughnessFile(value: File) {
        this._roughnessFile = value;
    }

    private _normalFile: File;

    get normalFile(): File {
        return this._normalFile;
    }

    set normalFile(value: File) {
        this._normalFile = value;
    }

    private _opacityFile: File;

    get opacityFile(): File {
        return this._opacityFile;
    }

    set opacityFile(value: File) {
        this._opacityFile = value;
    }

    private _emissiveFile: File;

    get emissiveFile(): File {
        return this._emissiveFile;
    }

    set emissiveFile(value: File) {
        this._emissiveFile = value;
    }

    // this may be the best im going to get this.
    static async getImageFiles(imageName: string, folderPath: string, materialTypes = ['albedo', 'roughness', 'metallic', 'normal', 'ao', 'opacity', 'emissive']) {


        return await Promise.all(
            materialTypes.map(async (materialType) =>
            {
                const fullPath = folderPath + imageName + '_' + materialType;


                const extensionChecks = ['.png', '.jpeg', '.jpg'].map(async (ext) =>
                {
                    const exists = await imageExists(fullPath + ext);
                    return exists ? ext : null;
                });

                const extensions = await Promise.all(extensionChecks);
                const foundExtension = extensions.find(ext => ext !== null);

                if (foundExtension) {
                    const file = await fileFromURL(fullPath + foundExtension);
                    return {
                        key: (materialType.toLowerCase() + 'File') as imageFileType,
                        file
                    };
                }
                return null;
            })
        );
    }

    /**
     @param nameOfTexture The name of the texture before the texture type. in the example something_albedo.png nameOfTexture should be 'something'
     @param pathToTextures The path in which the textures can be found
     @param materialTypes The types of files to search for. for example ['Albedo', 'Roughness' 'Metallic', 'Normal']
     */
    static async createFromFolderPath(nameOfTexture: string, pathToTextures: string, materialTypes = ['albedo', 'roughness', 'metallic', 'normal', 'ao', 'opacity', 'emissive']) {

        const files = await this.getImageFiles(nameOfTexture, pathToTextures, materialTypes)

        const material = new Material();

        files.forEach(f =>
        {
            if (f) {
                material[f.key] = f.file;
            }
        })

        return material
    }

    imageBitmapToImageData(imageBitmap: ImageBitmap): ImageData {
        const offscreenCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        ctx.drawImage(imageBitmap, 0, 0);
        return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    }

    packTextures(metallicData: ImageData | undefined,
                 roughnessData: ImageData | undefined,
                 aoData: ImageData | undefined,
                 opacityData: ImageData | undefined): ImageData {

        const width = roughnessData?.width ?? 1024;
        const height = roughnessData?.height ?? 1024;
        const packedData = new Uint8ClampedArray(width * height * 4);

        for (let i = 0; i < width * height; i++) {
            const o = i * 4;
            packedData[o] = roughnessData?.data[o] ?? 0;   // R channel (roughness)
            packedData[o + 1] = metallicData?.data[o] ?? 0;     // G channel (metallic)
            packedData[o + 2] = aoData?.data[o] ?? 255;          // B channel (AO)
            packedData[o + 3] = opacityData?.data[0] ?? 255;                      // A opacity
        }


        return new ImageData(packedData, width, height);
    }

    async initialize() {
        let albedoImageBitmap,
            roughnessImageBitmap,
            metallicImageBitmap,
            normalImageBitmap,
            emissiveImageBitmap: ImageBitmap | undefined = undefined;
        let roughnessData, metallicData, aoData, opacityData: ImageData | undefined = undefined;
        if (this._albedoFile) {
            albedoImageBitmap = await createImageBitmap(this._albedoFile)
        }

        if (this._roughnessFile) {
            roughnessImageBitmap = await createImageBitmap(this._roughnessFile);
            roughnessData = this.imageBitmapToImageData(roughnessImageBitmap);
        }
        if (this._metallicFile) {
            metallicImageBitmap = await createImageBitmap(this._metallicFile);
            metallicData = this.imageBitmapToImageData(metallicImageBitmap);
        }
        if (this._normalFile) {
            normalImageBitmap = await createImageBitmap(this._normalFile);
        }

        if (this._aoFile) {
            aoData = this.imageBitmapToImageData(await createImageBitmap(this._aoFile));
        }

        if (!this._opacityFile) {
            this._opacityFile = await fileFromURL('/media/defaults/material/default_metallic.png');
        }

        opacityData = this.imageBitmapToImageData(await createImageBitmap(this._opacityFile));

        if (!this._emissiveFile) {
            this._emissiveFile = await fileFromURL('/media/defaults/material/default_emissive.png');
        }

        emissiveImageBitmap = await createImageBitmap(this._emissiveFile);


        const roughnessMetallicAO = await createImageBitmap(this.packTextures(metallicData, roughnessData, aoData, opacityData));


        const albedoTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: albedoImageBitmap?.width ?? 1024,
                height: albedoImageBitmap?.height ?? 1024,
            },
            mipLevelCount: numMipLevels(albedoImageBitmap?.width ?? 1024, albedoImageBitmap?.height ?? 1024),
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        const emissiveTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: emissiveImageBitmap?.width ?? 1024,
                height: emissiveImageBitmap?.height ?? 1024,
            },
            mipLevelCount: numMipLevels(emissiveImageBitmap?.width ?? 1024, emissiveImageBitmap?.height ?? 1024),
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        const normalTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: normalImageBitmap?.width ?? 1024,
                height: normalImageBitmap?.height ?? 1024,
            },
            mipLevelCount: numMipLevels(normalImageBitmap?.width ?? 1024, normalImageBitmap?.height ?? 1024),
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,

        }

        const roughnessMetallicAOTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: roughnessMetallicAO.width,
                height: roughnessMetallicAO.height,
            },
            mipLevelCount: numMipLevels(roughnessMetallicAO.width, roughnessMetallicAO.height),
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this._albedoTexture = $WGPU.device.createTexture(albedoTextureDescriptor);
        this._normalTexture = $WGPU.device.createTexture(normalTextureDescriptor);
        this._emissiveTexture = $WGPU.device.createTexture(emissiveTextureDescriptor);
        this._roughnessMetallicAOTexture = $WGPU.device.createTexture(roughnessMetallicAOTextureDescriptor);
        if (albedoImageBitmap === undefined || normalImageBitmap === undefined) {
            throw new Error('Failed to create textures. Please check the texture descriptors and ensure the GPU supports the required formats.');
        }
        this.loadImageBitmap(albedoImageBitmap, this._albedoTexture);
        this.loadImageBitmap(normalImageBitmap, this._normalTexture);
        this.loadImageBitmap(roughnessMetallicAO, this._roughnessMetallicAOTexture);
        this.loadImageBitmap(emissiveImageBitmap, this._emissiveTexture);

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: navigator.gpu.getPreferredCanvasFormat(),
            aspect: "all",
            dimension: "2d",
        }
        this._albedoView = this._albedoTexture.createView(viewDescriptor);
        this._normalView = this._normalTexture.createView(viewDescriptor);
        this._emissiveView = this._emissiveTexture.createView(viewDescriptor);
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
                },
                {
                    binding: 4,
                    resource: this._emissiveView
                }
            ]
        })

    }


    loadImageBitmap(imageBitmap: ImageBitmap, texture: GPUTexture) {

        $WGPU.device.queue.copyExternalImageToTexture(
            {source: imageBitmap},
            {
                texture: texture,
            },
            {width: imageBitmap.width, height: imageBitmap.height}
        )

        if (texture.mipLevelCount > 1) {
            generateMips($WGPU.device, texture);
        }
    }


    async refresh() {
        await this.initialize();
    }
}