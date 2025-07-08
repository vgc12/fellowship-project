import {CameraController} from "@/Controls/camera-controller.ts";
import {Slider} from "@/components/slider-component.tsx";
import {useCallback, useEffect, useReducer} from "react";
import {cn} from "@/lib/utils.ts";
import type {Vector3} from "@/core/math/vector3.ts";


function renderForVectorUpdate(vector: Vector3) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const forceRender = useCallback(() => forceUpdate(), []);


    useEffect(() =>
    {

        const forceUpdate = () =>
        {
            forceRender();
        }

        vector.addCallback(forceUpdate);

    }, [forceRender]);

}

function SceneObjectComponent(props: { object: CameraController }) {

    renderForVectorUpdate(props.object.orbitRotation);


    type Axis = 'x' | 'y' | 'z';
    return (
        <li className={" border-neutral-600 border-4 rounded-md  mt-2"}>
            <div className={"bg-transparent p-4 text-center"}>
                <div className={"text-center"}>
                    <h1>Camera Controller</h1>
                </div>
                <div className={"text-center justify-items-center"}>

                    {

                        ['x', 'y'].map((val) =>
                        {

                            return <>
                                <h1>{val == 'x' ? 'Vertical Rotation' : 'Horizontal Rotation'}</h1>
                                <Slider className={cn(["w-2/3"])} step={0.1} min={0} max={361}
                                        value={[props.object.orbitRotation[val as Axis] % 360]} onValueCommit={() =>
                                {

                                    props.object.changedBySlider = false;
                                }} defaultValue={[props.object.orbitRotation[val as Axis]]} onValueChange={(e) =>
                                {


                                    props.object.changedBySlider = true;

                                    props.object.setOrbitRotation(val === 'x' ? e[0] : 0, val === 'y' ? e[0] : 0);

                                }}></Slider>
                            </>
                        })
                    }

                </div>

            </div>
        </li>
    )
}

export default SceneObjectComponent;