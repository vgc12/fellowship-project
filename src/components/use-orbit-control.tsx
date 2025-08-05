import {useCallback, useEffect, useRef, useState} from "react";
import {Direction} from "rc-joystick";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$TIME} from "@/utils/time.ts";


// eslint-disable-next-line @typescript-eslint/naming-convention
interface OrbitValues {
    azimuth: number,
    elevation: number,
}


export const useOrbitControl = (initialValues: OrbitValues) =>
{
    const orbitValues = useRef(initialValues);
    const prev = useRef(initialValues);

    const direction = useRef(Direction.Center);
    const distance = useRef(0);

    const animationFrameId = useRef(0);
    const [running, setRunning] = useState(false);


    const run = () =>
    {

        updateDirection(direction.current, distance.current);

        $WGPU.cameraController.orbitExternallyChanged = true;

        $WGPU.cameraController.setOrbitRotation(orbitValues.current.elevation, orbitValues.current.azimuth);

        animationFrameId.current = requestAnimationFrame(run);

    }


    const onJoystickChange = useCallback((jv: { direction: Direction, distance: number }) =>
    {

        direction.current = jv.direction;
        distance.current = jv.distance;

    }, [])


    useEffect(() =>
    {
        if (running) {
            animationFrameId.current = requestAnimationFrame(run);
        } else {
            cancelAnimationFrame(animationFrameId.current);
            $WGPU.cameraController.orbitExternallyChanged = false;
        }

        return () =>
        {
            cancelAnimationFrame(animationFrameId.current);
            $WGPU.cameraController.orbitExternallyChanged = false;
        };

    }, [running]);

    const updateDirection = useCallback((direction: Direction, step = 1) =>
    {

        if (direction === Direction.Center) return;

        step *= $TIME.deltaTime;
        const directionDeltas = {
            [Direction.Top]: {azimuth: 0, elevation: -step},
            [Direction.Bottom]: {azimuth: 0, elevation: step},
            [Direction.Left]: {azimuth: -step, elevation: 0},
            [Direction.Right]: {azimuth: step, elevation: 0},
            [Direction.TopLeft]: {azimuth: -step, elevation: step},
            [Direction.RightTop]: {azimuth: step, elevation: step},
            [Direction.BottomRight]: {azimuth: step, elevation: -step},
            [Direction.LeftBottom]: {azimuth: step, elevation: -step},
            [Direction.Center]: {azimuth: 0, elevation: 0}
        };


        const delta = directionDeltas[direction];

        orbitValues.current = {
            azimuth: prev.current.azimuth + delta.azimuth,
            elevation: prev.current.elevation + delta.elevation,

        };

        prev.current = orbitValues.current;

    }, []);


    return {orbitValues, onJoystickChange, setRunning};
};