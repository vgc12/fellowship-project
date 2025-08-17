import {useCallback, useEffect, useRef, useState} from "react";
import {Direction} from "rc-joystick";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$TIME} from "@/utils/time.ts";
import {$INPUT} from "@/Controls/input.ts";

// eslint-disable-next-line @typescript-eslint/naming-convention


export const useOrbitControl = () => {


    const direction = useRef(Direction.Center);
    const distance = useRef(0);

    const animationFrameId = useRef(0);
    const [running, setRunning] = useState(false);


    const run = () => {


        updateDirection(direction.current, distance.current * $TIME.deltaTime * $INPUT.sensitivity);


        animationFrameId.current = requestAnimationFrame(run);

    }


    const onJoystickChange = useCallback((jv: { direction: Direction, distance: number }) => {

        direction.current = jv.direction;
        distance.current = jv.distance;

    }, [])


    useEffect(() => {
        if (running) {

            $WGPU.cameraController.orbitExternallyChanged = true;
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

        $WGPU.cameraController.xMovementThisFrame = delta.azimuth
        $WGPU.cameraController.yMovementThisFrame = delta.elevation


    }, []);


    return {onJoystickChange, setRunning};
};