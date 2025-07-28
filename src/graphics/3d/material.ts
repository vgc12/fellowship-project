import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {fileFromURL, imageExists} from "@/lib/utils.ts";
import {type imageFileType} from "@/components/texture-input-component.tsx";


export class Material {
    get aoFile(): File {
        return this._aoFile;
    }

    set aoFile(value: File) {
        this._aoFile = value;
    }

    // this may be the best im going to get this.
    static async getImageFiles(imageName: string, folderPath: string, materialTypes = ['albedo', 'roughness', 'metallic', 'normal', 'ao', 'opacity']) {


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
    static async createFromFolderPath(nameOfTexture: string, pathToTextures: string, materialTypes = ['albedo', 'roughness', 'metallic', 'normal', 'ao', 'opacity']) {

        const files = await this.getImageFiles(nameOfTexture, pathToTextures, materialTypes)

        const material = new Material();

        files.forEach(f => {
            if(f){
                material[f.key] = f.file;
            }
        })

        return material
    }


    get sampler(): GPUSampler {
        return this._sampler;
    }


    get normalFile(): File {
        return this._normalFile;
    }

    set normalFile(value: File) {
        this._normalFile = value;
    }

    get opacityFile(): File {
        return this._opacityFile;
    }
    set opacityFile(value: File) {
        this._opacityFile = value;
    }


    private _roughnessMetallicAOView: GPUTextureView;


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
    private _aoFile: File;

    private _metallicFile: File;
    private _roughnessFile: File;
    private _normalFile: File;
    private _opacityFile: File;


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
                 opacityData: ImageData | undefined): ImageData{

        const width = roughnessData?.width ?? 1024;
        const height=roughnessData?.height ?? 1024;
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
        let albedoImageBitmap, roughnessImageBitmap,metallicImageBitmap,normalImageBitmap : ImageBitmap | undefined = undefined;
        let roughnessData, metallicData, aoData, opacityData: ImageData | undefined = undefined;
        if(this._albedoFile) {
            albedoImageBitmap = await createImageBitmap(this._albedoFile)
        }

        if(this._roughnessFile) {
            roughnessImageBitmap = await createImageBitmap(this._roughnessFile);
            roughnessData = this.imageBitmapToImageData(roughnessImageBitmap);
        }
        if(this._metallicFile) {
            metallicImageBitmap = await createImageBitmap(this._metallicFile);
            metallicData = this.imageBitmapToImageData(metallicImageBitmap);
        }
        if(this._normalFile) {
            normalImageBitmap = await createImageBitmap(this._normalFile);
        }

        if(this._aoFile){
            aoData = this.imageBitmapToImageData(await createImageBitmap(this._aoFile));
        }
        if(this._opacityFile) {
            opacityData = this.imageBitmapToImageData(await createImageBitmap(this._opacityFile));
        }


        const roughnessMetallicAO = await createImageBitmap(this.packTextures(metallicData, roughnessData, aoData, opacityData));


        const albedoTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: albedoImageBitmap?.width ?? 1024,
                height: albedoImageBitmap?.height ?? 1024,
            },

            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        }

        const normalTextureDescriptor: GPUTextureDescriptor = {
            size: {
                width: normalImageBitmap?.width ?? 1024,
                height: normalImageBitmap?.height ?? 1024,
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
        if(albedoImageBitmap === undefined || normalImageBitmap === undefined ) {
            throw new Error('Failed to create textures. Please check the texture descriptors and ensure the GPU supports the required formats.');
        }
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