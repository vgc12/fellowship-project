import {useCallback, useEffect, useRef, useState} from "react";
import {Direction} from "rc-joystick";
import {$TIME} from "@/utils/time.ts";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$INPUT} from "@/Controls/input.ts";


export const usePanControl = () => {

    const sensitivity = $INPUT.sensitivity / 4;

    const direction = useRef(Direction.Center);
    const distance = useRef(0);

    const animationFrameId = useRef(0);
    const [running, setRunning] = useState(false);


    const run = () => {


        updateDirection(direction.current, distance.current * $TIME.deltaTime * sensitivity);


        animationFrameId.current = requestAnimationFrame(run);

    }


    const onJoystickChange = useCallback((jv: { direction: Direction, distance: number }) => {
        direction.current = jv.direction;
        distance.current = jv.distance;
    }, [])


    useEffect(() => {
        if (running) {

            $WGPU.cameraController.panExternallyChanged = true;
            animationFrameId.current = requestAnimationFrame(run);

        } else {
            cancelAnimationFrame(animationFrameId.current);
            $WGPU.cameraController.fpsExternallyChanged = false;
        }

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            $WGPU.cameraController.fpsExternallyChanged = false;
        };

    }, [running]);

    const updateDirection = useCallback((direction: Direction, distance = 1) => {


        const directionDeltas = {
            [Direction.Top]: {x: 0, y: -distance},
            [Direction.Bottom]: {x: 0, y: distance},
            [Direction.Left]: {x: distance, y: 0},
            [Direction.Right]: {x: -distance, y: 0},
            [Direction.TopLeft]: {x: -distance, y: distance},
            [Direction.RightTop]: {x: distance, y: distance},
            [Direction.BottomRight]: {x: distance, y: -distance},
            [Direction.LeftBottom]: {x: distance, y: -distance},
            [Direction.Center]: {x: 0, y: 0}
        };


        const delta = directionDeltas[direction];

        $WGPU.cameraController.xMovementThisFrame = delta.x;
        $WGPU.cameraController.yMovementThisFrame = delta.y;

    }, []);


    return {onJoystickChange, setRunning};
};