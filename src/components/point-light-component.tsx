import {VectorInputComponent} from "./vector-input-component.tsx";

import type {PointLight} from "@/scene/point-light.ts";
import {LightComponent} from "@/components/light-component.tsx";

function SpotLightComponent(props: { object: PointLight }) {


    return (
        <li className={" border-neutral-600 border-4 rounded-md  mt-2"}>
            <div className={"bg-transparent p-4 text-center"}>
                <div className={"text-center"}>
                    <h1>{props.object.name}</h1>
                </div>
                <div className={"text-center"}>

                    <LightComponent object={props.object}></LightComponent>

                    <VectorInputComponent label={'Intensity'} numberLabels={['']} values={[props.object.intensity]}
                                          step={1} onChange={
                        (value) => {
                            props.object.intensity = value;
                        }
                    }>

                    </VectorInputComponent>


                </div>


            </div>
        </li>
    )
}


export default SpotLightComponent;