
import {type ChangeEvent, useRef, useState} from "react";
import {InputComponent} from "@/components/input-component.tsx";
import type {RenderableObject} from "@/scene/renderable-object.ts";
import {Material} from "@/graphics/3d/material.ts";

export type imageFileType = 'albedoFile' | 'metallicFile' | 'aoFile' | 'roughnessFile';

export const ImageFileTypes: imageFileType[] = [
    'albedoFile',
    'metallicFile',
    'aoFile',
    'roughnessFile'
];

export function TextureInputComponent(props: { object: RenderableObject, textureType : imageFileType }) {

    const [texture, setTexture] = useState<string>(`./img/default_${props.textureType.slice(0, props.textureType.length-4)}.png`);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOnClick = () => {
        fileInputRef.current?.click();
    }

    const handleOnChange = async (e: ChangeEvent<HTMLInputElement>) => {

        if (!e.target.files) return;
        const file = e.target.files[0];


        if (file.type.startsWith('image/')) {
            const fileReader = new FileReader();

            fileReader.onload = () => {

                setTexture(fileReader.result as string);

            }
            fileReader.readAsDataURL(file);

            const material = new Material()

            material[props.textureType] = file
            console.log("Setting material", props.textureType, file);

            for (const fileType of ImageFileTypes ){

                if(fileType === props.textureType) continue;

                material[fileType] = props.object.material[fileType]


            }
           await material.initialize();

            props.object.material = material;




        }
    }
    return (
        <div className={"text-left"}>
            <label className={"t"}>{props.textureType.slice(0,props.textureType.length-4) + " Texture "}</label>
            <InputComponent ref={fileInputRef} hidden={true} type={"file"} id="file-input" multiple
                            onChange={(e) => handleOnChange(e)}/>
            <img className={"w-1/5"} onClick={handleOnClick} src={texture}
                 alt={props.textureType.slice(0,props.textureType.length-4) + " Texture " + props.object.name}></img>
        </div>
    )
}