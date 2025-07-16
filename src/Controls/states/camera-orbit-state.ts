import type {IState} from "@/core/state-machine/IState.ts";
import {CameraController} from "@/Controls/camera-controller.ts";

export class CameraOrbitState implements IState {
    private readonly _controller: CameraController;

    constructor(controller: CameraController) {
        this._controller = controller;
    }


    update(): void {
        this._controller.clampOrbitRadius();
        this._controller.adjustCameraPosition();
        this._controller.rotateAroundTarget();

    }

}