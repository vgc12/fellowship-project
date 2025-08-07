import React, {useState} from "react";
import {cn} from "@/lib/utils.ts";

interface PanelProps {
    children?: React.ReactNode
    className?: string
    maxHeight?: number
    label?: string
    grow?: boolean
    flex?: string
}

export const Panel: React.FC<PanelProps> = ({children, maxHeight, className, label, grow, flex}) => {

    const [enabled, setEnabled] = useState(true);

    return (


        <div className={cn(flex && enabled ? `flex-${flex}` : '', `transition-all transition-discrete duration-500 w-100 flex flex-col dark:text-white 
        text-black dark:bg-gray-800 bg-gray-100 rounded-2xl p-6 shadow-[0_0_15px_-5px_rgba(0,0,0,0.1)] 
                shadow-gray-800 h-${enabled ? maxHeight ?? 'auto' : 'auto pb-2'} `, className, grow && enabled ? 'grow' : '')}>
            <button onClick={() => setEnabled(!enabled)}>
                <h3 className=" text-lg font-semibold mb-4 flex items-center gap-2">
                    {label}
                </h3>
            </button>
            {enabled && children}
        </div>

    )
}