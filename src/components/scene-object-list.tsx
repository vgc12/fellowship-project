import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import SceneObject from "./scene-object.tsx";
import {type JSX, useMemo, useState} from "react";
import {RenderableObject} from "@/scene/renderable-object.ts";
import type {IObject} from "@/scene/IObject.ts";
import {SpotLightComponent} from "@/components/spot-light.tsx";
import PointLightComponent from "./point-light-component.tsx";
import type {PointLight} from "@/scene/point-light.ts";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

import {Panel} from "@/components/panel.tsx";
import type {SpotLight} from "@/scene/spot-light.ts";


const createObject = (selectedObject: IObject): JSX.Element => {
    const componentMap: Record<string, () => JSX.Element> = {

        SpotLight: () => (
            <SpotLightComponent
                key={selectedObject.guid}
                object={selectedObject as SpotLight}
            />
        ),
        PointLight: () => (
            <PointLightComponent
                key={selectedObject.guid}
                object={selectedObject as PointLight}
            />
        ),
    };

    const ComponentFactory = componentMap[selectedObject.constructor.name];

    return ComponentFactory ? (
        ComponentFactory()
    ) : (
        <SceneObject
            key={selectedObject.guid}
            object={selectedObject as RenderableObject}
        />
    );
};

interface SceneObjectListComponentProps {
    objects: IObject[];
}

export function SceneObjectList({objects}: SceneObjectListComponentProps) {

    if (objects.length === 0) {
        return null;
    }

    const [selectedObject, setSelectedObject] = useState<IObject | null>(null);

    const filteredObjects = useMemo(
        () => objects.filter(obj => obj.guid !== $WGPU.mainCamera.guid
            && obj.guid !== $WGPU.cameraController.guid),
        [objects]
    );

    const handleObjectSelect = (obj: IObject) => {
        setSelectedObject(prev => prev?.guid === obj.guid ? null : obj);
    };

    const isSelected = (obj: IObject) => selectedObject?.guid === obj.guid;

    return (
        <Panel grow={true} label={'Objects'} className={'mt-5'}>


            <ScrollArea className={'grow h-15 '}>
                {filteredObjects.map((obj) => (
                    <div className={`px-4 mt-1`} key={obj.guid}>
                        <button
                            className={`
                w-full text-left px-4 py-2 rounded-lg font-medium text-sm
               
                ${isSelected(obj)
                                ? 'bg-gray-500 dark:hover:bg-blue-700 dark:text-white'
                                : 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                            }
                
              `}
                            onClick={() => handleObjectSelect(obj)}
                            aria-expanded={isSelected(obj)}
                            aria-controls={`object-details-${obj.guid}`}
                        >
              <span className="flex items-center justify-between">
                {obj.name}

              </span>
                        </button>

                        {isSelected(obj) && (
                            <div
                                id={`object-details-${obj.guid}`}
                                className="  p-3 bg-gray-700 rounded-lg border-4 border-blue-500"
                            >
                                {createObject(obj)}
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>

        </Panel>

    );
}