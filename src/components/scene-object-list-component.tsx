import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import SceneObjectComponent from "./scene-object-component.tsx";
import {type JSX, useState} from "react";
import {RenderableObject} from "@/scene/renderable-object.ts";
import type {IObject} from "@/scene/IObject.ts";



export function SceneObjectListComponent(props: {objects: IObject[]}) {

    if (props.objects.length === 0) {
        return <></>
    }

    const [selectedObject, setSelectedObject] = useState<IObject | null>(null);

    const buttonClicked = (o: IObject) =>{
        setSelectedObject(o);
    }
    let component: JSX.Element;


    component = selectedObject == null ? <></> :
        <SceneObjectComponent key={selectedObject.guid} object={selectedObject as RenderableObject}/>;

    return (

       <div className={" bg-gray-800 text-white p-4 mb-8 rounded-md text-center flex flex-col " }>
            {component}
            {props.objects.map(o => {
                if( o.guid !== $WGPU.mainCamera.guid && o.guid !== $WGPU.cameraController.guid) {
                    return <button key={o.guid} className={`
                    text-white bg-gray-700 hover:bg-gray-500 focus:outline-none 
                    focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm 
                    px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 
                    dark:focus:ring-gray-700 dark:border-gray-700
                `} onClick={() => buttonClicked(o)}>{o.name}</button>
                }
            })}

        </div>
    )
}