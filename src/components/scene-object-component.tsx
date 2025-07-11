import {Vector3InputComponent} from "./vector3-input-component.tsx";


import {ImageFileTypes, TextureInputComponent} from "@/components/texture-input-component.tsx";
import type {RenderableObject} from "@/scene/renderable-object.ts";




function SceneObjectComponent(props: { object: RenderableObject }) {


    type TransformType = 'position' | 'rotation' | 'scale';
    return (
        <li className={" border-neutral-600 border-4 rounded-md  mt-2"}>
        <div className={"bg-transparent p-4 text-center" }>
         <div className={"text-center"}>
            <h1>{props.object.name}</h1>
         </div>
            <div className={"text-center"}>


                {
                    // This is still a little ugly but much better than before


                        ['Position', 'Rotation', 'Scale'].map(label => {

                        const transformKey = label.toLowerCase() as TransformType;
                        const values = transformKey === 'rotation' ?
                            props.object.transform[transformKey]['eulerAngles'] :
                            props.object.transform[transformKey];
                        return <Vector3InputComponent  label={label} values={values.toArray} onChange={
                            (val, axis) => {
                                values[axis] = val;
                            }
                        }/>
                    } )
                }

            </div>

            {
                ImageFileTypes.map ((type) => {
                    return <TextureInputComponent object={props.object} textureType={type} />
                })
            }


        </div>
        </li>
    )
}

export default SceneObjectComponent;