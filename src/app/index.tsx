import {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import { Scene } from './scene.ts';
import FileUploadComponent from "./file-upload-component.tsx";
import {$WGPU} from "../core/webgpu/webgpu-singleton.ts";
import IVector3InputProps from './scene-object.tsx';
import type {IObject} from "../scene/IObject.ts";

function useWGPUObjects() {
    const [objects, setObjects] = useState($WGPU.objects);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshObjects = () => {
        setObjects([...$WGPU.objects]);
        setRefreshTrigger(prev => prev + 1);
    }

    return {objects, refreshObjects};
}


function CanvasComponent() {
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
        <div>
            <canvas ref={canvasRef} width={1200} height={600} id="canvas-main" />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <div>
        <CanvasComponent />
        <FileUploadComponent name="file-input"/>
        <ModelListComponent  />
    </div>
    );



function ModelListComponent() {
    const {objects, refreshObjects} = useWGPUObjects();

    // Optional: Auto-refresh every few seconds
    useEffect(() => {
        const interval = setInterval(refreshObjects, 0);
        return () => clearInterval(interval);
    }, []);

    return (
       <div>
           {objects.map(o => {
               return <IVector3InputProps object={o}></IVector3InputProps>
           })}
       </div>
    )
}