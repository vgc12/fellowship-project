import type {IObject} from "@/scene/IObject.ts";
import {Transform} from "../core/math/transform.ts";
import {Camera} from "@/scene/Camera.ts";
import {$TIME} from "@/utils/time.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {$INPUT} from "@/Controls/input.ts";
import {clamp} from "@/core/math/math-util.ts";
import type {IState} from "@/core/state-machine/IState.ts";
import {StateMachine} from "@/core/state-machine/state-machine.ts";
import type {IPredicate} from "@/core/state-machine/IPredicate.ts";
import {CameraFirstPersonState} from "@/Controls/states/camera-first-person-state.ts";
import {IdleState} from "@/Controls/states/idle-state.ts";
import {CameraPanState} from "@/Controls/states/camera-pan-state.ts";
import {CameraOrbitState} from "@/Controls/states/camera-orbit-state.ts";

export class ZoomState implements IState {
    private readonly _cameraController: CameraController;

    constructor(cameraController: CameraController) {
        this._cameraController = cameraController;
    }

    update(): void {
        this._cameraController.adjustCameraPosition();
        this._cameraController.clampOrbitRadius()
    }

}


export class CameraController implements IObject {
    set guid(value: string) {
        this._guid = value;
    }

    get name(): string {
        return this._name;
    }

    get guid(): string {
        return this._guid;
    }

    get transform(): Transform {
        return this._transform;
    }

    get camera(): Camera {
        return this._camera;
    }

    get cameraTarget(): Transform {
        return this._cameraTarget;
    }

    get orbitRadius(): number {
        return this._orbitRadius;
    }

    set orbitRadius(value: number) {
        this._orbitRadius = value;
    }

    get orbitRotation(): Vector3 {
        return this._orbitRotation;
    }

    get changedBySlider(): boolean {
        return this._changedBySlider;
    }

    set changedBySlider(value: boolean) {
        this._changedBySlider = value;
    }

    private readonly _name: string;
    private _guid: string;
    private readonly _transform: Transform;
    private readonly _camera: Camera;
    private readonly _cameraTarget: Transform;

    private _orbitRadius: number = 5;
    private _orbitRotation: Vector3;
    private _changedBySlider: boolean = false;
    private _yMovementThisFrame: number = 0;
    private _xMovementThisFrame: number = 0;
    private _stateMachine: StateMachine;


    constructor(camera: Camera) {
        this._name = 'Camera Controller';
        this._guid = crypto.randomUUID();
        this._transform = new Transform();
        this._camera = camera
        this._cameraTarget = new Transform();
        this._orbitRotation = new Vector3()

        this._stateMachine = new StateMachine();

        this.setUpStateMachine();

    }

    setUpStateMachine() {
        const orbitState = new CameraOrbitState(this);
        const panState = new CameraPanState(this);
        const firstPersonState = new CameraFirstPersonState(this);
        const idleState = new IdleState();
        const zoomState = new ZoomState(this);

        // Away from Idle
        this.at(idleState, orbitState, {
            evaluate: () => {
                return $INPUT.middleMouseButtonPressed || this._changedBySlider
            }
        });
        this.at(idleState, panState, {
            evaluate: () => {
                return $INPUT.middleMouseButtonPressed && $INPUT.shiftKeyPressed
            }
        });
        this.at(idleState, firstPersonState, {
            evaluate: () => {
                return $INPUT.altKeyPressed
            }
        });
        this.at(idleState, zoomState, {
            evaluate: () => {
                return $INPUT.scrollMovementY != 0
            }
        })

        // Away from Orbit
        this.at(orbitState, panState, {
            evaluate: () => {
                return $INPUT.shiftKeyPressed
            }
        });
        this.at(orbitState, firstPersonState, {
            evaluate: () => {
                return $INPUT.altKeyPressed
            }
        });
        this.at(orbitState, idleState, {
            evaluate: () => {
                return !$INPUT.middleMouseButtonPressed
            }
        });
        this.at(orbitState, zoomState, {
            evaluate: () => {
                return $INPUT.scrollMovementY != 0
            }
        })

        // Away from Pan
        this.at(panState, orbitState, {
            evaluate: () => {
                return !$INPUT.shiftKeyPressed && $INPUT.middleMouseButtonPressed
            }
        });
        this.at(panState, firstPersonState, {
            evaluate: () => {
                return $INPUT.altKeyPressed
            }
        });
        this.at(panState, idleState, {
            evaluate: () => {
                return !$INPUT.middleMouseButtonPressed && !$INPUT.shiftKeyPressed
            }
        });
        this.at(panState, zoomState, {
            evaluate: () => {
                return $INPUT.scrollMovementY != 0
            }
        })

        // Away from First Person
        this.at(firstPersonState, orbitState, {
            evaluate: () => {
                return $INPUT.middleMouseButtonPressed && !$INPUT.altKeyPressed
            }
        });
        this.at(firstPersonState, panState, {
            evaluate: () => {
                return $INPUT.middleMouseButtonPressed && $INPUT.shiftKeyPressed && !$INPUT.altKeyPressed
            }
        });
        this.at(firstPersonState, idleState, {
            evaluate: () => {
                return !$INPUT.altKeyPressed
            }
        });
        this.at(firstPersonState, zoomState, {
            evaluate: () => {
                return $INPUT.scrollMovementY != 0
            }
        })

        // Away from zoom
        this.at(zoomState, idleState, {
            evaluate: () => {
                return $INPUT.scrollMovementY == 0
            }
        });


        this._stateMachine.setState(idleState);
    }

    private at(from: IState, to: IState, condition: IPredicate) {
        this._stateMachine.addTransition(from, to, condition);
    }

    update(): void {
        this._yMovementThisFrame = $INPUT.movementY * $INPUT.sensitivity * $TIME.deltaTime;
        this._xMovementThisFrame = $INPUT.movementX * $INPUT.sensitivity * $TIME.deltaTime;

        this._stateMachine.update();
    }

    setOrbitRotation(x: number = 0, y: number = 0) {
        if (x == 0) {
            x = this._orbitRotation.x;
        }
        if (y == 0) {
            y = this._orbitRotation.y;
        }
        this._orbitRotation.set(x, y, 0);

    }

    clampOrbitRadius() {
        this._orbitRadius = clamp(this._orbitRadius + $INPUT.scrollMovementY * $TIME.deltaTime, 1, 10000);
    }


    // Orbit mode
    adjustCameraPosition() {
        this._camera.transform.position.set(
            this._cameraTarget.position.x - this._cameraTarget.forward.x * this._orbitRadius,
            this._cameraTarget.position.y - this._cameraTarget.forward.y * this._orbitRadius,
            this._cameraTarget.position.z - this._cameraTarget.forward.z * this._orbitRadius
        );
    }

    // pan mode
    adjustTargetPosition() {
        this._cameraTarget.position.set(
            this._camera.transform.position.x + this._camera.transform.forward.x * this._orbitRadius,
            this._camera.transform.position.y + this._camera.transform.forward.y * this._orbitRadius,
            this._camera.transform.position.z + this._camera.transform.forward.z * this._orbitRadius
        )
    }

    rotateFirstPerson() {


        this._orbitRotation.x += this._yMovementThisFrame;
        this._orbitRotation.y += this._xMovementThisFrame;

        this._orbitRotation.x = clamp(this._orbitRotation.x, -90, 90);

        this._camera.transform.rotation.setFromEuler(this._orbitRotation.x, this._orbitRotation.y, 0);
    }

    rotateAroundTarget() {

        this._orbitRotation.x += this._yMovementThisFrame;
        this._orbitRotation.y += this._xMovementThisFrame;

        this._cameraTarget.rotation.setFromEuler(this._orbitRotation.x, this._orbitRotation.y, 0);

        Vector3.subtract(this._cameraTarget.position,
            Vector3.multiplyScalar(this._cameraTarget.forward, this._orbitRadius),
            this._camera.transform.position);


        this._camera.transform.rotation = this._cameraTarget.rotation;
    }


    shiftCamera() {

        const panMultiplier = 0.1;

        this._camera.transform.position = Vector3.add(this._camera.transform.position, Vector3.multiplyScalar(this._camera.transform.right, -this._xMovementThisFrame * panMultiplier));
        this._camera.transform.position = Vector3.add(this._camera.transform.position, Vector3.multiplyScalar(this._camera.transform.up, this._yMovementThisFrame * panMultiplier));

        this._cameraTarget.position = Vector3.add(
            this._cameraTarget.position,
            Vector3.multiplyScalar(
                this._camera.transform.right,
                -this._xMovementThisFrame * panMultiplier
            )
        );
        this._cameraTarget.position = Vector3.add(
            this._cameraTarget.position,
            Vector3.multiplyScalar(this._camera.transform.up, this._yMovementThisFrame * panMultiplier)
        );

    }

}