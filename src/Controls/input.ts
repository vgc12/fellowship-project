import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";

export class Input {
    private static _instance: Input;

    static get Instance(): Input {
        if (!this._instance) {
            this._instance = new Input();

        }
        return this._instance;
    }

    private _shiftKeyPressed: boolean = false;

    get shiftKeyPressed(): boolean {
        return this._shiftKeyPressed;
    }

    private _altKeyPressed: boolean = false;

    get altKeyPressed(): boolean {
        return this._altKeyPressed;
    }

    private _pointerLocked: boolean = false;

    get pointerLocked(): boolean {
        return this._pointerLocked;
    }

    private _middleMouseButtonPressed: boolean = false;

    get middleMouseButtonPressed(): boolean {
        return this._middleMouseButtonPressed;
    }

    private _canvas: HTMLCanvasElement;

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    private _movementX: number = 0;

    get movementX(): number {
        return this._movementX;
    }

    private _movementY: number = 0;

    get movementY(): number {
        return this._movementY;
    }

    private _scrollMovementY: number = 0;

    get scrollMovementY(): number {
        return this._scrollMovementY;
    }

    private _sensitivity: number = 50;

    get sensitivity(): number {
        return this._sensitivity;
    }

    set sensitivity(value: number) {
        this._sensitivity = value;
    }

    initialize() {

        this._canvas = $WGPU.canvas

        let mouseTimer = 0;
        document.onmousemove = (e) =>
        {
            this._movementX = e.movementX;
            this._movementY = e.movementY;

            clearTimeout(mouseTimer);

            mouseTimer = setTimeout(() =>
            {
                this._movementX = 0;
                this._movementY = 0;
            }, 10);

        }


        document.onkeydown = (e) =>
        {
            this._altKeyPressed = e.altKey;
            this._shiftKeyPressed = e.shiftKey;

            this.lockPointerToCanvas();

        }


        document.onkeyup = async (e) =>
        {
            this._altKeyPressed = e.altKey;
            this._shiftKeyPressed = e.shiftKey;
            this.unlockPointerFromCanvas();
        }

        this._canvas.onmousedown = (e) =>
        {
            if (e.button === 1) { // Middle mouse button
                this._middleMouseButtonPressed = true;

                this.lockPointerToCanvas();
            }
        }


        document.onmouseup = (e) =>
        {
            if (e.button === 1) { // Middle mouse button
                this._middleMouseButtonPressed = false;
                this.unlockPointerFromCanvas();
            }
        }

        let mouseWheelTimer = 0;
        this._canvas.onwheel = (ev) =>
        {
            this._scrollMovementY = ev.deltaY;
            clearTimeout(mouseWheelTimer);

            mouseWheelTimer = setTimeout(() =>
            {
                this._scrollMovementY = 0;
            }, 10);
        }


    }

    lockPointerToElement(element: HTMLElement) {
        if (!this._pointerLocked) {
            element.requestPointerLock().then(() =>
            {
                this._pointerLocked = true;
            }).catch((err) =>
            {
                console.error("Failed to lock pointer: ", err);
            })
        }
    }

    lockPointerToCanvas() {
        if (!this._pointerLocked) {
            this._canvas.requestPointerLock().then(() =>
            {
                this._pointerLocked = true;
            }).catch((err) =>
            {
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


}

export const $INPUT = Input.Instance;
