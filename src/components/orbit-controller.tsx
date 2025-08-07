import {useCallback, useEffect, useRef, useState} from "react";
import {useOrbitControl} from "@/components/use-orbit-control.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import Joystick, {DirectionCount, type IJoystickChangeValue} from "rc-joystick";
import {ZoomIn, ZoomOut} from "lucide-react";
import {UseCssClass} from "@/components/use-css-class.tsx";

export const OrbitController = () => {

    const {buttonLightRectangle} = UseCssClass();

    const {onJoystickChange, setRunning} = useOrbitControl();

    const [distance, setDistance] = useState($WGPU.cameraController.orbitRadius)


    useEffect(() => {
        $WGPU.cameraController.orbitRadius = distance;

    }, [distance]);


    const intervalRef = useRef(0);

    useEffect(() => {

        intervalRef.current = setInterval(() => {
            if ($WGPU?.cameraController?.orbitRadius !== undefined) {
                setDistance($WGPU.cameraController.orbitRadius);
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const activeChanged = useCallback((c: boolean) => setRunning(c), [setRunning]);

    const changed = (jv: IJoystickChangeValue) => onJoystickChange(jv);


    return (<div className=" flex justify-center items-center ">
        <div className="items-center flex flex-col gap-4">
            <Joystick baseRadius={40} controllerRadius={20} autoReset={true}
                      className={'!box-content dark:!bg-gray-800 !bg-gray-100'}
                      onActiveChange={activeChanged} directionCount={DirectionCount.Five}
                      onChange={changed}>
            </Joystick>
            <div className="flex items-center justify-center gap-2">
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