import ReactDOM from 'react-dom/client';


import {SceneObjectListComponent} from "../components/ui/scene-object-list-component.tsx";
import {CanvasComponent} from "./canvas-component.tsx";
import {Input} from "@/components/ui/input.tsx";

import {type ChangeEvent, useEffect, useState} from "react";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";


function App () {
    const [loadedFiles, setLoadedFiles] = useState<File[]>([]);
    const handleOnChange = async (e: ChangeEvent<HTMLInputElement>) =>{
        if (e.target.files) {
            for (const file of e.target.files) {
                if (loadedFiles.includes(file)) continue;

                if (file.name.endsWith('.obj')) {
                    await OBJLoader.loadMeshes(file);
                    setLoadedFiles([...loadedFiles, file]);
                }
            }
        }
    }

    return (<div id='app' className={"flex m-4"}>
        <CanvasComponent />
        <div>

            <SceneObjectListComponent />
            <Input type={"file"} id="file-input" multiple onChange={(e) => handleOnChange(e)} />
        </div>
    </div>);
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App />
);



