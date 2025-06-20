import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import SceneObject from "./scene-object.tsx";


export function SceneObjectListComponent() {
    // forceRefreshOnNewObject();

    return (
        <div className={"bg-background p-4 rounded-md text-center flex flex-col " }>
            {$WGPU.objects.map(o => {
                return <SceneObject key={o.guid} object={o}></SceneObject>
            })}

        </div>
    )
}