import React from "react";

import {Panel} from "@/components/dropdown-panel.tsx";

interface MainCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width?: number;
    height?: number;
    label?: string;
    children?: React.ReactNode;
}


export const MainCanvas: React.FC<MainCanvasProps> = ({
                                                          canvasRef,
                                                          width = 1920,
                                                          height = 1080,
                                                          children,
                                                      }) => (
    <div className=" grow ">
        <div className={'flex gap-5 '}>
            <Panel grow={true} className={' p-2 w-[65vw] h-[90vh]'}>
                <canvas className={' rounded-md w-[100%] h-[100%]'}
                        ref={canvasRef}
                        width={width}
                        height={height}
                        id="canvas-main"
                />
            </Panel>
            {children}
        </div>
    </div>
);