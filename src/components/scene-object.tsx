import {VectorInputComponent} from "./vector-input-component.tsx";


import {ImageFileTypes, TextureInput} from "@/components/texture-input.tsx";
import type {RenderableObject} from "@/scene/renderable-object.ts";


function SceneObject(props: { object: RenderableObject }) {


    type TransformType = 'position' | 'rotation' | 'scale';
    return (
        <li className={" "}>
            <div className={"bg-transparent p-4 text-center"}>
                <div className={"text-center"}>
                    <h1 className={'mb-2 text-lg'}>{props.object.name[0].toUpperCase() + props.object.name.slice(1)}</h1>
                </div>
                <div className={"text-center  rounded-xl p-4 mb-4"}>


                    {
                        // This is still a little ugly but much better than before


                        ['Position', 'Rotation', 'Scale'].map(label =>
                        {

                            const transformKey = label.toLowerCase() as TransformType;
                            const values = transformKey === 'rotation' ?
                                props.object.transform[transformKey]['eulerAngles'] :
                                props.object.transform[transformKey];
                            return <VectorInputComponent label={label} values={values.toArray} onChange={
                                (val, axis) =>
                                {
                                    values[axis as 'x' | 'y' | 'z'] = val;
                                }
                            }/>
                        })
                    }

                </div>
                <div className={'grid grid-cols-2 gap-4'}>
                    {
                        ImageFileTypes.map((type) =>
                        {
                            return <TextureInput object={props.object} textureType={type}/>
                        })
                    }

                </div>
            </div>
        </li>
    )
}

export default SceneObject;