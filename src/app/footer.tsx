import {Drawer, DrawerContent, DrawerHeader} from "@/components/ui/drawer.tsx";
import {TriggerLightRectangle} from "@/components/use-css-class.tsx";
import React from "react";

export const Footer: React.FC = () =>
{
    return (
        <footer className={'flex flex-row justify-start items-center gap-2'}>

            <div className={'p-4 m-2 '}>
                <div className={'w-[3vh] h-[3vh]'}></div>
            </div>
            <Drawer>
                <TriggerLightRectangle className={'w-[4vw]'}>
                    Credits
                </TriggerLightRectangle>
                <DrawerContent className={'h-[50vh] '} aria-label="Content">
                    <DrawerHeader>
                        <DrawerHeader>Credits</DrawerHeader>
                    </DrawerHeader>
                    <div className="flex justify-center flex-col gap-2">
                        <div className={'self-center font-normal text-center text-lg'}>

                            <a href={'https://sketchfab.com/3d-models/robot-steampunk-3d-coat-45-pbr-91eb0eb061024bf1bc5e3eb5ffe385d8#download'}>
                                <p>Robot Steampunk 3D-Coat 4.5 PBR by 3d-coat on Sketchfab, licensed under CC
                                    BY 4.0</p></a>

                            <a href={'https://sketchfab.com/3d-models/an-old-cheap-room-in-chinatown-9c2ec26be3cb4d9b91d51755e7210fdd'}>
                                <p>An Old Cheap Room in Chinatown by Qifan Zhang on Sketchfab, licensed under CC
                                    BY 4.0</p>
                            </a>
                            <a href={'https://sketchfab.com/3d-models/ps1-scene-9d9967c84dde4c6ab38ea94653fefd8d'}>
                                <p>PS1 Scene by Fiona Galloway on Sketchfab, licensed under CC BY 4.0</p></a>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </footer>
    )
}