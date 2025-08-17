import type {IState} from "@/core/state-machine/IState.ts";
import type {CameraController} from "@/Controls/camera-controller.ts";

export class IdleState implements IState {

    private readonly _cameraController: CameraController;

    constructor(cameraController: CameraController) {
        this._cameraController = cameraController;
    }

    update(): void {
        this._cameraController.adjustCameraPosition();
    }

}