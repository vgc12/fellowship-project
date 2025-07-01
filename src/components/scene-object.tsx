import {Vector3InputComponent} from "./vector3-input-component.tsx";


import {TextureInputComponent} from "@/components/texture-input-component.tsx";
import type {RenderableObject} from "@/scene/renderable-object.ts";


function SceneObject(props: { object: RenderableObject }) {


    return (
        <li className={" border-neutral-600 border-4 rounded-md  mt-2"}>
        <div className={"bg-transparent p-4 text-center" }>
         <div className={"text-center"}>
            <h1>{props.object.name}</h1>
         </div>
            <div className={"text-center"}>
                <Vector3InputComponent  label={"Position"} values={props.object.transform.position.toArray} onChange={
                    (val, axis) => {
                        switch(axis) {
                            case 'X':
                                props.object.transform.position.x = val;
                                break;
                            case 'Y':
                                props.object.transform.position.y = val;
                                break;
                            case 'Z':
                                props.object.transform.position.z = val;
                                break;
                        }
                    }
                }/>
                <Vector3InputComponent label={"Rotation"} values={props.object.transform.rotation.toArray} onChange={
                    (val, axis) => {
                        switch(axis) {
                            case 'X':
                                props.object.transform.rotation.x = val;
                                break;
                            case 'Y':
                                props.object.transform.rotation.y = val;
                                break;
                            case 'Z':
                                props.object.transform.rotation.z = val;
                                break;

                        }
                    }
                }/>

                <Vector3InputComponent label={"Scale"} values={props.object.transform.scale.toArray} onChange={
                    (val, axis) => {
                        switch(axis) {
                            case 'X':
                                props.object.transform.scale.x = val;
                                break;
                            case 'Y':
                                props.object.transform.scale.y = val;
                                break;
                            case 'Z':
                                props.object.transform.scale.z = val;
                                break;
                        }
                    }
                }/>



                </div>
          <TextureInputComponent object={props.object} />
        </div>
        </li>
    )
}

export default SceneObject;