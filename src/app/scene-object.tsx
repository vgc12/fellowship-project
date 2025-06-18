
import {Vector3InputComponent} from "./vector3-input-component.tsx";
import type {IObject} from "../scene/IObject.ts";

interface IModelProps {
    object: IObject;
    
}


function SceneObject({object}: IModelProps) {

    return (
        <li>
        <div>
         <h1>{object.name}</h1>
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
                }></Vector3InputComponent>
            </div>
        </div>
        </li>
    )
}

export default SceneObject;