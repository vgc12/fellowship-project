import {NumericScrubber} from "@/components/ui/number-scrubber.tsx";

interface IVector3InputProps{
    label: string;
    values: number[];
    onChange: (value: number, axis : string) => void;
}


export function Vector3InputComponent({label, values, onChange}: IVector3InputProps) {
    return (
        <div>
            <label>{label}</label>
            <div className={"flex"}>
                {['X', 'Y', 'Z'].map((axis, index) => (
                    <span key={index}  >
                        <label>{axis}</label>
                        <NumericScrubber
                            step={.1}
                            min={Number.NEGATIVE_INFINITY}
                            max={Number.POSITIVE_INFINITY}
                            value={values[index]}
                            onChange={(e) => onChange(e, axis)}></NumericScrubber>

                    </span>
                ))}
            </div>
        </div>
    );
}

export default Vector3InputComponent;