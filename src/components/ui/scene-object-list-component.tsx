import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import SceneObject from "./scene-object.tsx";
import {type JSX, useState} from "react";
import type {IObject} from "@/scene/IObject.ts";
import {CameraComponent} from "@/components/ui/camera-component.tsx";


export function SceneObjectListComponent() {
    // forceRefreshOnNewObject();
    const [selectedObject, setSelectedObject] = useState<IObject>($WGPU.objects[0]);

    const buttonClicked = (o: IObject) =>{
        setSelectedObject(o);
    }
    let component: JSX.Element;

    if (selectedObject == null) {
        component = <></>;
    }else if(selectedObject.guid == $WGPU.mainCamera.guid){
        component = <CameraComponent key={selectedObject.guid} object={selectedObject}></CameraComponent>
    }
    else {
        component = <SceneObject key={selectedObject.guid} object={selectedObject}/>;
    }
    return (
        <div className={" bg-gray-800 text-white p-4 mb-8 rounded-md text-center flex flex-col " }>
            {component}
            {$WGPU.objects.map(o => {

                return <button   className={`
                    text-white bg-gray-700 hover:bg-gray-500 focus:outline-none 
                    focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm 
                    px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 
                    dark:focus:ring-gray-700 dark:border-gray-700
                `} onClick={() => buttonClicked(o)}>{o.name}</button>
            })}



        </div>
    )
}