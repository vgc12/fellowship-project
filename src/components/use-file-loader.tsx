import {useState} from "react";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";

export const useFileLoader = () =>
{
    const [loadedFiles, setLoadedFiles] = useState<File[]>([]);

    const handleFileLoad = async (files: FileList | null) =>
    {
        if (!files) return;

        const newFiles: File[] = [];

        for (const file of Array.from(files)) {
            if (loadedFiles.some(loaded => loaded.name === file.name && loaded.size === file.size)) {
                continue;
            }

            if (file.name.endsWith('.obj')) {
                try {
                    $SCENE_MANAGER.currentScene.addRenderableObjectArray(await OBJLoader.loadMeshes(file));
                    newFiles.push(file);
                } catch (error) {
                    console.error(`Failed to load ${file.name}:`, error);
                }
            }
        }

        if (newFiles.length > 0) {
            setLoadedFiles(prev => [...prev, ...newFiles]);
        }
    }

    return {loadedFiles, handleFileLoad};
};