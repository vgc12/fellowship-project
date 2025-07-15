import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import SceneObjectComponent from "./scene-object-component.tsx";
import {type JSX, useState} from "react";
import {RenderableObject} from "@/scene/renderable-object.ts";
import type {IObject} from "@/scene/IObject.ts";
import type {CameraController} from "@/Controls/camera-controller.ts";
import CameraControllerComponent from "@/components/camera-controller-component.tsx";
import SpotLightComponent from "@/components/spot-light-component.tsx";
import type {SpotLight} from "@/scene/spot-light.ts";
import PointLightComponent from "./point-light-component.tsx";
import type {PointLight} from "@/scene/point-light.ts";



export function SceneObjectListComponent(props: {objects: IObject[]}) {

    if (props.objects.length === 0) {
        return <></>
    }

    const [selectedObject, setSelectedObject] = useState<IObject | null>(null);

    const buttonClicked = (o: IObject) =>{
        setSelectedObject(o);
    }
    let component: JSX.Element;


    if (selectedObject == null) {
        component = <></>;
    }
    else if(selectedObject.guid === $WGPU.cameraController.guid){
        component = <CameraControllerComponent key={selectedObject.guid} object={selectedObject as CameraController}/>;
    }
    else if(selectedObject.constructor.name === 'SpotLight') {
        console.log(selectedObject + " is a SpotLight");
        component = <SpotLightComponent key={selectedObject.guid} object={selectedObject as SpotLight}/>;
    }
    else if(selectedObject.constructor.name === 'PointLight'){
        console.log(selectedObject + " is a PointLight");
        component = <PointLightComponent key={selectedObject.guid} object={selectedObject as PointLight}/>;
    }
    else {
        component = <SceneObjectComponent key={selectedObject.guid} object={selectedObject as RenderableObject}/>;
    }

    return (

       <div className={" bg-gray-800 text-white p-4 mb-8 rounded-md text-center flex flex-col " }>
            {component}
            {props.objects.map(o => {
                if( o.guid !== $WGPU.mainCamera.guid) {
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