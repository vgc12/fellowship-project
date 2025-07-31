import {useCallback, useState} from "react";
import {OBJLoader} from "@/graphics/3d/obj-loader.ts";

export const useFileLoader = () => {
    const [loadedFiles, setLoadedFiles] = useState<File[]>([]);

    const handleFileLoad = useCallback(async (files: FileList | null) => {
        if (!files) return;

        const newFiles: File[] = [];

        for (const file of Array.from(files)) {
            if (loadedFiles.some(loaded => loaded.name === file.name && loaded.size === file.size)) {
                continue;
            }

            if (file.name.endsWith('.obj')) {
                try {
                    await OBJLoader.loadMeshes(file);
                    newFiles.push(file);
                } catch (error) {
                    console.error(`Failed to load ${file.name}:`, error);
                }
            }
        }

        if (newFiles.length > 0) {
            setLoadedFiles(prev => [...prev, ...newFiles]);
        }
    }, [loadedFiles]);

    return {loadedFiles, handleFileLoad};
};