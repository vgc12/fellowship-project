import React from "react";

interface MainCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width?: number;
    height?: number;
    children?: React.ReactNode;
}

export const MainCanvas: React.FC<MainCanvasProps> = ({
                                                          canvasRef,
                                                          width = 1920,
                                                          height = 1080,
                                                          children
                                                      }) => (
    <div className="mx-4">
        {children}
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            id="canvas-main"
        />
    </div>
);