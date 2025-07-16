import {NumericScrubber} from "@/components/number-scrubber-component.tsx";

interface IVector3InputProps{
    label: string;
    values: number[];
    onChange: (value: number, axis : 'x' | 'y' | 'z' ) => void;
}


export function Vector3InputComponent({label, values, onChange}: IVector3InputProps) {
    return (
        <div>
            <label>{label}</label>
            <div className={"flex justify-center mb-3"}>
                {['x', 'y', 'z'].map((axis, index) => (
                    <span key={index}  >
                        <label>{axis}</label>
                        <NumericScrubber
                            step={.1}
                            min={Number.NEGATIVE_INFINITY}
                            max={Number.POSITIVE_INFINITY}
                            value={values[index]}
                            onChange={(e) => onChange(e, axis as 'x' | 'y' | 'z')}></NumericScrubber>

                    </span>
                ))}
            </div>
        </div>
    );
}

export default Vector3InputComponent;