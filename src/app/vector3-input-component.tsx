import type IVector3InputProps from "./scene-object.tsx";

interface IVector3InputProps{
    label: string;
    values: number[];
    onChange: (value: number, axis : string) => void;
}


export function Vector3InputComponent({label, values, onChange}: IVector3InputProps) {
    return (
        <div>
            <label>{label}</label>
            <div>
                {['X', 'Y', 'Z'].map((axis, index) => (
                    <div key={axis}>
                        <label>{axis}</label>
                        <input
                            type="number"
                            value={values[index]}
                            onChange={(e) => onChange(e.target.valueAsNumber, axis)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Vector3InputComponent;