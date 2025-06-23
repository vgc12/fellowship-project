import type {IObject} from "@/scene/IObject.ts";
import {type ChangeEvent, useRef, useState} from "react";
import {Input} from "@/components/ui/input.tsx";

export function TextureInputComponent(props: { object: IObject }) {

    const [texture, setTexture] = useState<string>('./img/default.png');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOnClick = () => {
        fileInputRef.current?.click();
    }

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {

        if (!e.target.files) return;
        const file = e.target.files[0];
        console.log(e.target.files[0]);

        if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
            const fileReader = new FileReader();
            console.log(file);
            fileReader.onload = () => {
                console.log(fileReader.result);
                setTexture(fileReader.result as string);
            }
            fileReader.readAsDataURL(file);


        }
    }
    return (
        <div className={"text-left"}>
            <label className={"t"}>Main Texture</label>
            <Input ref={fileInputRef} hidden={true} type={"file"} id="file-input" multiple
                   onChange={(e) => handleOnChange(e)}/>
            <img className={"w-1/5"} onClick={handleOnClick} src={texture}
                 alt={"Main texture for " + props.object.name}></img>
        </div>
    )
}