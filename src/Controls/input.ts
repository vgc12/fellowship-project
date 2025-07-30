import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";

export class Input {
    get sensitivity(): number {
        return this._sensitivity;
    }

    set sensitivity(value: number) {
        this._sensitivity = value;
    }

    get scrollMovementY(): number {
        return this._scrollMovementY;
    }

    get movementY(): number {
        return this._movementY;
    }

    get movementX(): number {
        return this._movementX;
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    get altKeyPressed(): boolean {
        return this._altKeyPressed;
    }

    get pointerLocked(): boolean {
        return this._pointerLocked;
    }

    get shiftKeyPressed(): boolean {
        return this._shiftKeyPressed;
    }

    private _shiftKeyPressed: boolean = false;

    get middleMouseButtonPressed(): boolean {
        return this._middleMouseButtonPressed;
    }


    private _altKeyPressed: boolean = false;
    private _pointerLocked: boolean = false;
    private _middleMouseButtonPressed: boolean = false;
    private _canvas: HTMLCanvasElement;
    private _movementX: number = 0;
    private _movementY: number = 0;
    private _scrollMovementY: number = 0;
    private _sensitivity: number = 50;


    private static _instance: Input;

    initialize() {

        this._canvas = $WGPU.canvas

        let mouseTimer = 0;
        document.onmousemove = (e) => {
            this._movementX = e.movementX;
            this._movementY = e.movementY;

            clearTimeout(mouseTimer);

            mouseTimer = setTimeout(() => {
                this._movementX = 0;
                this._movementY = 0;
            }, 10);

        }


        document.onkeydown = (e) => {
            this._altKeyPressed = e.altKey;
            this._shiftKeyPressed = e.shiftKey;

            this.lockPointerToCanvas();

        }


        document.onkeyup = async (e) => {
            this._altKeyPressed = e.altKey;
            this._shiftKeyPressed = e.shiftKey;
            this.unlockPointerFromCanvas();
        }

        this._canvas.onmousedown = (e) => {
            if (e.button === 1) { // Middle mouse button
                this._middleMouseButtonPressed = true;

                this.lockPointerToCanvas();
            }
        }


        document.onmouseup = (e) => {
            if (e.button === 1) { // Middle mouse button
                this._middleMouseButtonPressed = false;
                this.unlockPointerFromCanvas();
            }
        }

        let mouseWheelTimer = 0;
        this._canvas.onwheel = (ev) => {
            this._scrollMovementY = ev.deltaY;
            clearTimeout(mouseWheelTimer);

            mouseWheelTimer = setTimeout(() => {
                this._scrollMovementY = 0;
            }, 10);
        }


    }

    lockPointerToCanvas() {
        if (!this._pointerLocked) {
            this._canvas.requestPointerLock().then(() => {
                this._pointerLocked = true;
            }).catch((err) => {
                console.error("Failed to lock pointer: ", err);
            })
        }
    }

    unlockPointerFromCanvas() {
        if (this._pointerLocked) {
            document.exitPointerLock();
            this._pointerLocked = false;
        }
    }

    static get Instance(): Input {
        if (!this._instance) {
            this._instance = new Input();

        }
        return this._instance;
    }


}

export const $INPUT = Input.Instance;
