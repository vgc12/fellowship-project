import {type ChangeEvent, useRef, useState} from "react";
import {Input} from "@/components/input.tsx";
import type {RenderableObject} from "@/scene/renderable-object.ts";
import {Material} from "@/graphics/3d/material.ts";

export type imageFileType =
    'albedoFile'
    | 'metallicFile'
    | 'roughnessFile'
    | 'normalFile'
    | 'aoFile'
    | 'opacityFile'
    | 'emissiveFile';

export const ImageFileTypes: imageFileType[] = [
    'albedoFile',
    'metallicFile',
    'roughnessFile',
    'normalFile',
    'aoFile',
    'opacityFile',
    'emissiveFile'
];


export function TextureInput(props: { object: RenderableObject, textureType: imageFileType }) {

    const [texture, setTexture] = useState<string>(`./img/default_${props.textureType.slice(0, props.textureType.length - 4)}.png`);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const setImage = (material: Material, textureType: imageFileType) => {
        if (!material[textureType]) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.readAsDataURL(material[textureType]);
        ``
        fileReader.onload = () => {
            setTexture(fileReader.result as string)
        }
    }
    setImage(props.object.material, props.textureType);
    const handleOnClick = () => {
        fileInputRef.current?.click();
    }


    const handleOnChange = async (e: ChangeEvent<HTMLInputElement>) => {

        if (!e.target.files) return;
        const file = e.target.files[0];


        if (file.type.startsWith('image/')) {


            const material = new Material()

            material[props.textureType] = file


            for (const fileType of ImageFileTypes) {

                if (fileType === props.textureType) continue;

                material[fileType] = props.object.material[fileType]

            }
            await material.initialize();

            props.object.material = material;
            setImage(material, props.textureType);


        }
    }

    return (
        <div className={"text-left"}>
            <label className={"t"}>{props.textureType.slice(0, props.textureType.length - 4) + " Texture "}</label>
            <Input ref={fileInputRef} hidden={true} type={"file"} id="file-input" multiple
                   onChange={(e) => handleOnChange(e)}/>
            <img className={"w-1/5"} onClick={handleOnClick} src={texture}
                 alt={props.textureType.slice(0, props.textureType.length - 4) + " Texture " + props.object.name}></img>
        </div>
    )
}