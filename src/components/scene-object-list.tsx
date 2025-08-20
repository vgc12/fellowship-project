import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {useEffect, useMemo, useRef, useState} from "react";
import type {IObject} from "@/scene/IObject.ts";
import {Light, PointLight} from "@/scene/point-light.ts";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

import {DropdownPanel} from "@/components/dropdown-panel.tsx";
import {SpotLight} from "@/scene/spot-light.ts";
import {Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger} from "./ui/menubar.tsx";
import {useFileLoader} from "@/components/use-file-loader.tsx";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {CreateIcon, CreateObject} from "@/components/create-object.tsx";


interface ISceneObjectListComponentProps {
    objects: IObject[];
}

export function SceneObjectList({objects}: ISceneObjectListComponentProps) {


    if (objects.length === 0) {
        return null;
    }


    const [selectedObject, setSelectedObject] = useState<IObject | null>(null);


    const [o, setO] = useState<IObject[]>(objects);

    useEffect(() =>
    {
        objects = o;
    }, [o])

    const filteredObjects = useMemo(
        () => objects.filter(obj => obj.guid !== $WGPU.mainCamera.guid
            && obj.guid !== $WGPU.cameraController.guid).sort(),
        [o, objects]
    );

    const handleObjectSelect = (obj: IObject) =>
    {
        setSelectedObject(prev => prev?.guid === obj.guid ? null : obj);
    };

    const isSelected = (obj: IObject) => selectedObject?.guid === obj.guid;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {handleFileLoad} = useFileLoader();

    const triggerFileUpload = () =>
    {
        fileInputRef.current?.click();
    };

    const addLight = (light: Light) =>
    {
        $SCENE_MANAGER.currentScene.addLight(light);
    }


    for (const e of document.querySelectorAll('[style*="display: table"]')) {
        if (e instanceof HTMLElement) {
            e.style.display = 'block';
        }
    }

    return (
        <DropdownPanel grow={true} label={'Objects'} className={'mt-1'}>
            <input
                hidden={true}
                type="file"
                id="file-input"
                multiple
                accept=".obj"
                ref={fileInputRef}
                onChange={(e) => handleFileLoad(e.target.files)}
            />
            <Menubar className={'bg-gray-300 dark:bg-gray-900 '}>
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={triggerFileUpload}>
                            Upload Model
                        </MenubarItem>


                    </MenubarContent>

                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Add Light</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={() =>
                        {
                            const light = new PointLight(new Vector3(1, 1, 1), 1);
                            addLight(light);
                            setO(prev => [...prev, light]);

                        }}>New Point Light</MenubarItem>
                        <MenubarItem onClick={() =>
                        {
                            const light = new SpotLight(new Vector3(1, 1, 1), 1, 5, 10)
                            addLight(light);
                            setO(prev => [...prev, light]);

                        }}>New Spot Light</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>


            <ScrollArea className={' pt-5 grow h-15 !block'}>
                {filteredObjects.map((obj) => (
                    <div className={`w-auto px-3 `}>
                        <button key={obj.guid}
                                className={`
                            
                            px-2 my-0 text-left indent-3 w-full h-10 rounded-md flex items-center 
                ${isSelected(obj)
                                    ? 'dark:bg-gray-900 bg-gray-300 hover:bg-gray-200  dark:hover:bg-gray-800  dark:text-white'
                                    : 'dark:bg-gray-800 dark:hover:bg-gray-900 dark:text-gray-200'
                                }
                
              `}
                                onClick={() => handleObjectSelect(obj)}
                                aria-expanded={isSelected(obj)}
                                aria-controls={`object-${obj.guid}`}
                        >
                            {CreateIcon(obj)}
                            {obj.name[0].toUpperCase() + obj.name.slice(1)}


                        </button>

                        {isSelected(obj) && (
                            <div
                                id={`object-details-${obj.guid}`}
                                className="  p-3 bg-gray-100 dark:bg-gray-800 rounded-lg  "
                            >
                                {CreateObject(obj)}
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>

        </DropdownPanel>

    );
}