import {NumericScrubber} from "@/components/number-scrubber-component.tsx";

interface IVector3InputProps {
    label: string;
    numberLabels?: string[]
    values: number[];
    step?: number;
    min?: number;
    max?: number;
    onChange: (value: number, axis: string) => void;
}


export function
VectorInputComponent({
                         label,
                         values,
                         onChange,
                         numberLabels = ['x', 'y', 'z'],
                         step = 0.1,
                         min = Number.NEGATIVE_INFINITY,
                         max = Number.POSITIVE_INFINITY
                     }: IVector3InputProps) {
    return (
        <div>
            <label>{label}</label>
            <div className={"flex justify-center mb-3"}>
                {numberLabels.map((axis, index) => (
                    <span key={index}>
                        <label>{axis}</label>
                        <NumericScrubber
                            step={step}
                            min={min}
                            max={max}
                            value={values[index]}
                            onChange={(e) => onChange(e, axis)}></NumericScrubber>

                    </span>
                ))}
            </div>
        </div>
    );
}

export default VectorInputComponent;