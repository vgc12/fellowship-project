import React from "react";

import {Panel} from "@/components/panel.tsx";

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
    <div className="mx-4 grow ">
        <div className={'flex gap-5'}>
            <Panel className={'w-auto w-[65vw] h-[85vh] grow pt-0'}>
                <canvas className={'grow rounded-md w-[100%] h-[100%]'}
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