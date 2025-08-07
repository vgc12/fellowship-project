import {useCallback, useEffect, useRef, useState} from "react";
import {Direction} from "rc-joystick";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$TIME} from "@/utils/time.ts";
import {$INPUT} from "@/Controls/input.ts";

// eslint-disable-next-line @typescript-eslint/naming-convention
interface OrbitValues {
    azimuth: number,
    elevation: number,
}


export const useOrbitControl = (initialValues: OrbitValues) => {
    const orbitValues = useRef(initialValues);
    const prev = useRef(initialValues);

    const direction = useRef(Direction.Center);
    const distance = useRef(0);

    const animationFrameId = useRef(0);
    const [running, setRunning] = useState(false);


    const run = () => {

        console.log(direction.current)
        updateDirection(direction.current, distance.current * $TIME.deltaTime * $INPUT.sensitivity);

        $WGPU.cameraController.orbitExternallyChanged = true;

        $WGPU.cameraController.setOrbitRotation(orbitValues.current.elevation, orbitValues.current.azimuth);

        animationFrameId.current = requestAnimationFrame(run);

    }


    const onJoystickChange = useCallback((jv: { direction: Direction, distance: number }) => {

        direction.current = jv.direction;
        distance.current = jv.distance;

    }, [])


    useEffect(() => {
        if (running) {
            orbitValues.current.azimuth = $WGPU.cameraController.orbitRotation.y;
            orbitValues.current.elevation = $WGPU.cameraController.orbitRotation.x;
            animationFrameId.current = requestAnimationFrame(run);

        } else {
            cancelAnimationFrame(animationFrameId.current);
            $WGPU.cameraController.orbitExternallyChanged = false;
        }

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            $WGPU.cameraController.orbitExternallyChanged = false;
        };

    }, [running]);

    const updateDirection = useCallback((direction: Direction, distance = 1) => {

        if (direction === Direction.Center) return;


        const directionDeltas = {
            [Direction.Top]: {azimuth: 0, elevation: -distance},
            [Direction.Bottom]: {azimuth: 0, elevation: distance},
            [Direction.Left]: {azimuth: -distance, elevation: 0},
            [Direction.Right]: {azimuth: distance, elevation: 0},
            [Direction.TopLeft]: {azimuth: -distance, elevation: distance},
            [Direction.RightTop]: {azimuth: distance, elevation: distance},
            [Direction.BottomRight]: {azimuth: distance, elevation: -distance},
            [Direction.LeftBottom]: {azimuth: distance, elevation: -distance},
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