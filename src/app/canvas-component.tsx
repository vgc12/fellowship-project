import {useEffect, useRef} from "react";
import {Scene} from "./scene.ts";

export function CanvasComponent() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const initializeScene = async () => {
            // This runs AFTER the component has rendered
            if (canvasRef.current) {
                const app = new Scene(canvasRef.current);
                await app.initialize();
                await app.run();
            }
        };

        initializeScene();
    }, []);

    return (
        <div className={"mr-4"}>
            <canvas ref={canvasRef} width={1200} height={600} id="canvas-main"/>
        </div>
    );
}