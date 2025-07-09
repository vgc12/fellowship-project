
import {type ChangeEvent, useRef, useState} from "react";
import {InputComponent} from "@/components/input-component.tsx";
import type {RenderableObject} from "@/scene/renderable-object.ts";
import {Material} from "@/graphics/3d/material.ts";

export function TextureInputComponent(props: { object: RenderableObject }) {

    const [texture, setTexture] = useState<string>('./img/default_albedo.png');
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

            const material = new Material();
            material.albedoFile = file
            await material.initialize();
            //await material.setAlbedoFile(file);

            props.object.material = material;


        }
    }
    return (
        <div className={"text-left"}>
            <label className={"t"}>Main Texture</label>
            <InputComponent ref={fileInputRef} hidden={true} type={"file"} id="file-input" multiple
                            onChange={(e) => handleOnChange(e)}/>
            <img className={"w-1/5"} onClick={handleOnClick} src={texture}
                 alt={"Main texture for " + props.object.name}></img>
        </div>
    )
}