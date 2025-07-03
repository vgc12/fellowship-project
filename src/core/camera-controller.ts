import type {IObject} from "@/scene/IObject.ts";
import {Transform} from "./math/transform";
import {Camera} from "@/scene/Camera.ts";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {$TIME} from "@/utils/time.ts";
import {Vector3} from "@/core/math/vector3.ts";
import {$INPUT} from "@/core/input.ts";
import {clamp} from "@/core/math/math-util.ts";

export class CameraController implements IObject {
    name: string;
    guid: string;
    transform: Transform;
    camera: Camera;
    cameraTarget: Transform;
    sensitivity: number = 50;
    orbitRadius: number = 3;
    orbitRotation: Vector3;
    firstPersonRotation: Vector3;



    constructor() {
        this.name = 'camera-controller';
        this.guid = crypto.randomUUID();
        this.transform = new Transform();
        this.camera = $WGPU.mainCamera;
        this.cameraTarget = new Transform();
        this.orbitRotation = Vector3.ZERO
        this.firstPersonRotation = Vector3.ZERO;
    }

    update(): void {

        this.clampOrbitRadius();
        this.setTargetPosition();
        this.rotateFirstPerson();
        this.rotateAroundTarget();
        this.shiftCamera();
    }


    clampOrbitRadius() {
        this.orbitRadius = clamp( this.orbitRadius + $INPUT.scrollMovementY * 0.1 * $TIME.deltaTime, 1, 100);
    }

    setTargetPosition(){

        if(!$INPUT.altKeyPressed && !$INPUT.shiftKeyPressed) {
            this.camera.transform.position.set(
                this.cameraTarget.position.x - this.cameraTarget.forward.x * this.orbitRadius,
                this.cameraTarget.position.y - this.cameraTarget.forward.y * this.orbitRadius,
                this.cameraTarget.position.z - this.cameraTarget.forward.z * this.orbitRadius
            );
        }

        if(!$INPUT.altKeyPressed && $INPUT.shiftKeyPressed) {
            this.cameraTarget.position.set(
                this.camera.transform.position.x + this.camera.transform.forward.x * this.orbitRadius,
                this.camera.transform.position.y + this.camera.transform.forward.y * this.orbitRadius,
                this.camera.transform.position.z + this.camera.transform.forward.z * this.orbitRadius
            )
        }

    }

    rotateFirstPerson() {

        if(!$INPUT.altKeyPressed) return;

        this.firstPersonRotation.x += $INPUT.movementY * this.sensitivity * $TIME.deltaTime;
        this.firstPersonRotation.y += $INPUT.movementX * this.sensitivity * $TIME.deltaTime;

       this.firstPersonRotation.x = clamp(this.firstPersonRotation.x, -90, 90);

       this.camera.transform.rotation.setFromEuler(this.firstPersonRotation.x, this.firstPersonRotation.y, 0);
    }

    rotateAroundTarget() {

        if ($INPUT.shiftKeyPressed || !$INPUT.middleMouseButtonPressed) return;


        this.orbitRotation.x += $TIME.deltaTime * $INPUT.movementY * this.sensitivity;
        this.orbitRotation.y += $TIME.deltaTime * $INPUT.movementX * this.sensitivity;

        this.cameraTarget.rotation.setFromEuler(this.orbitRotation.x, this.orbitRotation.y, 0);

         Vector3.subtract(this.cameraTarget.position,
             Vector3.multiplyScalar(this.cameraTarget.forward, this.orbitRadius),
             this.camera.transform.position);


        this.camera.transform.rotation = this.cameraTarget.rotation;
    }

    shiftCamera(){
        if(!$INPUT.shiftKeyPressed || !$INPUT.middleMouseButtonPressed) return;

        this.camera.transform.position = Vector3.add(this.camera.transform.position, Vector3.multiplyScalar(this.camera.transform.right, -$INPUT.movementX * .1 * this.sensitivity * $TIME.deltaTime));
        this.camera.transform.position = Vector3.add(this.camera.transform.position, Vector3.multiplyScalar(this.camera.transform.up,$INPUT.movementY * .1 * this.sensitivity * $TIME.deltaTime));

        this.cameraTarget.position = Vector3.add(
            this.cameraTarget.position,
            Vector3.multiplyScalar(
                this.camera.transform.right,
                -$INPUT.movementX * .1 * this.sensitivity * $TIME.deltaTime
            )
        );
        this.cameraTarget.position = Vector3.add(
            this.cameraTarget.position,
            Vector3.multiplyScalar(this.camera.transform.up, $INPUT.movementY * .1 * this.sensitivity * $TIME.deltaTime)
        );

    }

}