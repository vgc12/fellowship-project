import {VectorInputComponent} from "./vector-input-component.tsx";

import type {SpotLight} from "@/scene/spot-light.ts";
import LightComponent from "@/components/light-component.tsx";
import {toCamelCase} from "@/lib/utils.ts";



function SpotLightComponent(props: { object: SpotLight }) {



    return (
        <li className={" border-neutral-600 border-4 rounded-md  mt-2"}>
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
                                numberLabels={['Outer Angle', 'Inner Angle', 'Intensity']}
                                values={[props.object.outerAngle, props.object.innerAngle, props.object.intensity]}
                                onChange={(e, label) =>
                                {
                                    const prop = toCamelCase(label) as propName;

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

export default SpotLightComponent;