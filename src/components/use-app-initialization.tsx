import {useEffect, useRef, useState} from "react";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$INPUT} from "@/Controls/input.ts";
import {$TIME} from "@/utils/time.ts";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";

export const useAppInitialization = () => {
    const [isLoading, setIsLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const initializeAppCore = async () => {
            if (canvasRef.current) {
                setIsLoading(true);
                try {
                    await $WGPU.initialize();
                    $INPUT.initialize();
                    $TIME.initialize();
                    await $SCENE_MANAGER.initializeAllScenes();
                } catch (error) {
                    console.error('Failed to initialize app core:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        initializeAppCore();
    }, []);

    return {isLoading, setIsLoading, canvasRef};
};