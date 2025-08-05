import {useCallback, useEffect, useRef, useState} from "react";
import {useOrbitControl} from "@/components/use-orbit-control.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import Joystick, {DirectionCount, type IJoystickChangeValue} from "rc-joystick";
import {ZoomIn, ZoomOut} from "lucide-react";

export const OrbitControllerComponent = () =>
{


    const {onJoystickChange, setRunning} = useOrbitControl({
        azimuth: 0,
        elevation: 0,

    });

    const [distance, setDistance] = useState(10)

    useEffect(() =>
    {
        $WGPU.cameraController.orbitRadius = distance;

    }, [distance]);


    const intervalRef = useRef(0);

    useEffect(() =>
    {

        intervalRef.current = setInterval(() =>
        {
            if ($WGPU?.cameraController?.orbitRadius !== undefined) {
                setDistance($WGPU.cameraController.orbitRadius);
            }
        }, 16);

        return () =>
        {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const activeChanged = useCallback((c: boolean) => setRunning(c), [setRunning]);

    const changed = useCallback((jv: IJoystickChangeValue) => onJoystickChange(jv),
        [onJoystickChange]);

    return (<div className="flex items-center justify-center">
        <div className="relative">
            <Joystick controllerClassName={'bg-gray-800 rounded-lg shadow-lg'}
                      onActiveChange={activeChanged} directionCount={DirectionCount.Five}
                      onChange={changed}>
            </Joystick>
            <div className="flex items-center justify-center mt-4 gap-2">
                <button onClick={() => setDistance(distance + 1)}
                        className="p-2 bg-gray-900 rounded-lg shadow hover:shadow-md transition-shadow">
                    <ZoomOut className="w-4 h-4 text-gray-100"/>
                </button>
                <div className="bg-gray-900 rounded-lg shadow px-3 py-2 text-sm text-gray-100">
                    Zoom: {distance}
                </div>
                <button onClick={() => setDistance(distance - 1)}
                        className="p-2 bg-gray-900 rounded-lg shadow hover:shadow-md transition-shadow">
                    <ZoomIn className="w-4 h-4 text-gray-100"/>
                </button>
            </div>
        </div>
    </div>)
}