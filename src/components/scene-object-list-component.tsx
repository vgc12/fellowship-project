import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import SceneObjectComponent from "./scene-object-component.tsx";
import {type JSX, useState, useMemo} from "react";
import {RenderableObject} from "@/scene/renderable-object.ts";
import type {IObject} from "@/scene/IObject.ts";
import SpotLightComponent from "@/components/spot-light-component.tsx";
import type {SpotLight} from "@/scene/spot-light.ts";
import PointLightComponent from "./point-light-component.tsx";
import type {PointLight} from "@/scene/point-light.ts";

import {ScrollArea} from "@/components/ui/scroll-area.tsx";


const createObjectComponent = (selectedObject: IObject): JSX.Element => {
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
        <SceneObjectComponent
            key={selectedObject.guid}
            object={selectedObject as RenderableObject}
        />
    );
};

interface SceneObjectListComponentProps {
    objects: IObject[];
}

export function SceneObjectListComponent({objects}: SceneObjectListComponentProps) {

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
        <div className="bg-gray-800 text-white p-4 mb-8 rounded-md">
            <div className="space-y-2">

                <ScrollArea className={'h-232'}>
                    {filteredObjects.map((obj) => (
                        <div className={`px-4 mt-1`} key={obj.guid}>
                            <button
                                className={`
                w-full text-left px-4 py-2 rounded-lg font-medium text-sm
                transition-colors duration-200
                ${isSelected(obj)
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                focus:ring-offset-gray-800
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
                                    {createObjectComponent(obj)}
                                </div>
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>

    );
}