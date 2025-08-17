import type {IObject} from "@/scene/IObject.ts";
import {type JSX} from "react";
import {SpotLightComponent} from "@/components/spot-light.tsx";
import {SpotLight} from "@/scene/spot-light.ts";
import PointLightComponent from "@/components/point-light-component.tsx";
import {PointLight} from "@/scene/point-light.ts";
import SceneObject from "@/components/scene-object.tsx";
import {RenderableObject} from "@/scene/renderable-object.ts";
import {FaCube, FaRegLightbulb} from "react-icons/fa";
import {IoMdFlashlight} from "react-icons/io";

export const CreateObject = (selectedObject: IObject): JSX.Element =>
{
    const componentMap: Record<string, () => JSX.Element> = {

        // eslint-disable-next-line @typescript-eslint/naming-convention
        SpotLight: () => (
            <SpotLightComponent
                key={selectedObject.guid}
                object={selectedObject as SpotLight}
            />
        ),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        PointLight: () => (
            <PointLightComponent
                key={selectedObject.guid}
                object={selectedObject as PointLight}
            />
        ),
    };

    const componentFactory = componentMap[selectedObject.constructor.name];

    return componentFactory ? (
        componentFactory()
    ) : (
        <SceneObject
            key={selectedObject.guid}
            object={selectedObject as RenderableObject}
        />
    );
};

export const CreateIcon = (selectedObject: IObject): JSX.Element =>
{
    const iconMap: Record<string, () => JSX.Element> = {
        SpotLight: () => (<IoMdFlashlight className={'light-icon'}/>),
        PointLight: () => (<FaRegLightbulb className={'light-icon'}/>),
    }

    const iconFactory = iconMap[selectedObject.constructor.name];

    return iconFactory ? (
        iconFactory()
    ) : (
        <FaCube className={'cube-icon'}/>
    );
}