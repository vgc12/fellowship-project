import {VectorInputComponent} from "./vector-input-component.tsx";

import type {SpotLight} from "@/scene/spot-light.ts";
import LightComponent from "@/components/light-component.tsx";
import {toCamelCase} from "@/lib/utils.ts";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";


export function SpotLightComponent(props: { object: SpotLight }) {


    return (
        <li className={" rounded-md  mt-2"}>
            <div className={"bg-transparent p-4 text-center"}>
                <div className={"text-center"}>
                    <h1>{props.object.name}</h1>
                </div>
                <div className={"text-center"}>
                    <LightComponent object={props.object}></LightComponent>
                    {(() =>
                    {
                        type propName = 'outerAngle' | 'innerAngle' | 'intensity';
                        return (

                            <VectorInputComponent
                                label={'Light '}
                                numberLabels={['Outer', 'Inner', 'Intensity']}
                                values={[props.object.outerAngle, props.object.innerAngle, props.object.intensity]}
                                onChange={(e, label) =>
                                {
                                    console.log($WGPU.device.limits);
                                    const camelLabel = toCamelCase(label);
                                    const prop = (camelLabel + (camelLabel == 'intensity' ? '' : 'Angle')).replace(' ', '') as propName;
                                    console.log((camelLabel + (camelLabel == 'intensity' ? '' : 'Angle')).replace(' ', ''), prop);
                                    props.object[prop] = e;
                                }}
                            />

                        );
                    })()}


                </div>
            </div>
        </li>
    )
}

