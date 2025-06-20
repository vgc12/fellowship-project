
import {Vector3InputComponent} from "./vector3-input-component.tsx";
import type {IObject} from "../../scene/IObject.ts";
import {Input} from "@/components/ui/input.tsx";

interface IModelProps {
    object: IObject;
    
}


function SceneObject({object}: IModelProps) {

    return (
        <li className={"bg-neutral-500 border-neutral-600 border-4 rounded-md  mt-2"}>
        <div className={"bg-transparent p-4 text-center" }>
         <div >
            <h1>{object.name}</h1>
         </div>
            <div>
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
                <Input type={"file"} id={object.guid} onChange={}>Main texture</Input>

            </div>
        </div>
        </li>
    )
}

export default SceneObject;