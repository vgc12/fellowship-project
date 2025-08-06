import {useCallback, useEffect, useRef, useState} from "react";
import {useOrbitControl} from "@/components/use-orbit-control.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import Joystick, {DirectionCount, type IJoystickChangeValue} from "rc-joystick";
import {ZoomIn, ZoomOut} from "lucide-react";
import {UseCssClass} from "@/components/use-css-class.tsx";

export const OrbitControllerComponent = () =>
{

    const {buttonLightRectangle} = UseCssClass();

    const {onJoystickChange, setRunning} = useOrbitControl({
        azimuth: 0,
        elevation: 0,

    });

    const [distance, setDistance] = useState($WGPU.cameraController.orbitRadius)

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
        <div className="items-center justify-center flex-1 flex flex-col gap-4">
            <Joystick className={' dark:!bg-gray-800 !bg-gray-100'}
                      onActiveChange={activeChanged} directionCount={DirectionCount.Five}
                      onChange={changed}>
            </Joystick>
            <div className="flex items-center justify-center mt-4 gap-2">
                <button onClick={() => setDistance(distance + 1)}
                        className={buttonLightRectangle}>
                    <ZoomOut className="w-4 h-4"/>
                </button>
                <div
                    className=" dark:text-white dark:bg-gray-800 bg-white rounded-lg shadow px-3 py-2 text-sm ">
                    Zoom: {distance}
                </div>
                <button onClick={() => setDistance(distance - 1)}
                        className={buttonLightRectangle + ' ' + (distance <= 1 ? 'opacity-50' : '')}>
                    <ZoomIn className="w-4 h-4 "/>
                </button>
            </div>
        </div>
    </div>)
}