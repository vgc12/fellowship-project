import type {IObject} from "@/scene/IObject.ts";
import Vector3InputComponent from "@/components/vector3-input-component.tsx";




export function CameraComponent(props: { object: IObject }) {

    return (
        <li className=" border-neutral-600 border-4 rounded-md mt-2">
            <div className="bg-transparent p-4">
                <div className="text-center mb-4">
                    <h1 className="text-xl font-semibold">{props.object.name}</h1>
                </div>
                
                <div className="">
                    {['Position', 'Rotation'].map(label =>
                    {
                        const transformKey = label.toLowerCase() as 'position' | 'rotation';
                        const values = transformKey === 'rotation' ?
                            props.object.transform[transformKey].eulerAngles :
                            props.object.transform[transformKey];

                        return <Vector3InputComponent
                            label={label}
                            values={values.toArray}
                            onChange={(val, axis) =>
                            {
                                values[axis] = val;
                            }}
                        />
                    })}

                </div>
            </div>
        </li>
    );
}