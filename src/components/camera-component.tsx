import type {IObject} from "@/scene/IObject.ts";
import Vector3InputComponent from "@/components/vector3-input-component.tsx";



export function CameraComponent(props: { object: IObject }) {
    const handleTransformChange = (
        transformType: 'position' | 'rotation',
        value: number,
        axis: string
    ) => {
        const axisKey = axis.toLowerCase() as 'x' | 'y' | 'z';
        props.object.transform[transformType][axisKey] = value;
    };

    return (
        <li className="fade-in border-neutral-600 border-4 rounded-md mt-2">
            <div className="bg-transparent p-4">
                <div className="text-center mb-4">
                    <h1 className="text-xl font-semibold">{props.object.name}</h1>
                </div>
                
                <div className="space-y-4">
                    <Vector3InputComponent 
                        label="Position" 
                        values={props.object.transform.position.toArray}
                        onChange={(val, axis) => handleTransformChange('position', val, axis)}
                    />
                    
                    <Vector3InputComponent 
                        label="Rotation" 
                        values={props.object.transform.rotation.toArray}
                        onChange={(val, axis) => handleTransformChange('rotation', val, axis)}
                    />
                </div>
            </div>
        </li>
    );
}