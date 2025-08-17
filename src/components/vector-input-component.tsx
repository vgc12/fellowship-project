import {NumericScrubber} from "@/components/number-scrubber.tsx";

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
        <div className={'flex  rounded-xl m-3 w-auto  items-center'}>
            <h3 className={'font-regular w-30  '}>{label}</h3>
            <div className={"flex items-center justify-center w-full mt-3"}>
                {numberLabels.map((axis, index) => (
                    <span key={index}>
                        {axis != '' && <label className={''}>{axis[0].toUpperCase() + axis.slice(1)}</label>}
                        <NumericScrubber
                            className={'border-none  w-10 my-1 mx-2 transition-all transition-discrete duration-500 dark:text-white shadow-gray-800  text-black dark:bg-gray-900 bg-gray-100 shadow-[0_0_15px_-5px_rgba(0,0,0,0.1)]  '}
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