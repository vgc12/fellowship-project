
import {Vector3InputComponent} from "./vector3-input-component.tsx";

import {type ChangeEvent,  useRef, useState} from "react";
import {Input} from "@/components/ui/input.tsx";

import type {IObject} from "@/scene/IObject.ts";


interface IModelProps {
    object: IObject;
    
}


function TextureInputComponent(props : {object : IObject}) {

    const [texture, setTexture] = useState<string >('./dist/models/default.png');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOnClick = () => {
        fileInputRef.current?.click();
    }

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {

        if(!e.target.files) return;
        const file = e.target.files[0];
        console.log(e.target.files[0]);

        if ( file.name.endsWith('.jpg') || file.name.endsWith('.png')){
            const fileReader =  new FileReader();
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
            <Input ref={fileInputRef} hidden={true} type={"file"}  id="file-input" multiple onChange={(e) => handleOnChange(e)} />
            <img className={"w-1/5"} onClick={handleOnClick}  src={texture}  alt={"Main texture for " + props.object.name}></img>
        </div>
    )
}


function SceneObject({object}: IModelProps) {


    return (
        <li className={" border-neutral-600 border-4 rounded-md  mt-2"}>
        <div className={"bg-transparent p-4 text-center" }>
         <div className={"text-center"}>
            <h1>{object.name}</h1>
         </div>
            <div className={"text-center"}>
                <Vector3InputComponent  label={"Position"} values={object.transform.position.toArray} onChange={
                    (val, axis) => {
                        switch(axis) {
                            case 'X':
                                object.transform.position.x = val;
                                break;
                            case 'Y':
                                object.transform.position.y = val;
                                break;
                            case 'Z':
                                object.transform.position.z = val;
                                break;
                        }
                    }
                }/>
                <Vector3InputComponent label={"Rotation"} values={object.transform.rotation.toArray} onChange={
                    (val, axis) => {
                        switch(axis) {
                            case 'X':
                                object.transform.rotation.x = val;
                                break;
                            case 'Y':
                                object.transform.rotation.y = val;
                                break;
                            case 'Z':
                                object.transform.rotation.z = val;
                                break;

                        }
                    }
                }/>

                <Vector3InputComponent label={"Scale"} values={object.transform.scale.toArray} onChange={
                    (val, axis) => {
                        switch(axis) {
                            case 'X':
                                object.transform.scale.x = val;
                                break;
                            case 'Y':
                                object.transform.scale.y = val;
                                break;
                            case 'Z':
                                object.transform.scale.z = val;
                                break;
                        }
                    }
                }/>



                </div>
          <TextureInputComponent object={object} />
        </div>
        </li>
    )
}

export default SceneObject;