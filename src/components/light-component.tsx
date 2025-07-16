import type {Light} from "@/scene/point-light.ts";
import VectorInputComponent from "@/components/vector-input-component.tsx";
import {toCamelCase} from "@/lib/utils.ts";

export function LightComponent(props: { object: Light }) {
    type TransformType = 'position' | 'rotation';

    return (
        <>
            {['Position', 'Rotation'].map(label => {
                const transformKey = toCamelCase(label) as TransformType;
                const values = transformKey === 'rotation'
                    ? props.object.transform[transformKey]['eulerAngles']
                    : props.object.transform[transformKey];

                return (
                    <VectorInputComponent
                        label={label}
                        key={label}
                        numberLabels={['x', 'y', 'z']}
                        values={values.toArray}
                        onChange={(val, axis) => {
                            const transformKey = axis as 'x' | 'y' | 'z';
                            values[transformKey] = val;
                        }}
                    />
                );
            })}

            <VectorInputComponent
                min={0}
                max={1}
                step={0.01}
                label={'Color'}
                numberLabels={['R', 'G', 'B']}
                values={props.object.color.toArray}
                onChange={(value, axis) => {
                    // convert r g b string to x y z
                    const colorMap: Record<string, 'x' | 'y' | 'z'> = {
                        R: 'x',
                        G: 'y',
                        B: 'z'
                    };

                    props.object.color[colorMap[axis]] = value;
                }}
            />
        </>
    );
}

export default LightComponent;