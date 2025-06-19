export class Time {
    get deltaTime(): number {
        return this._deltaTime;
    }

    private static _instance: Time | undefined;

    private _lastFrameTime: number = 0;
    private _deltaTime: number = 0;

    static get Instance() {
        if (!this._instance) {
            this._instance = new Time();

        }
        return this._instance;
    }


    initialize() {

        this._deltaTime = 0;
        this._lastFrameTime = 0;
        requestAnimationFrame(this.update)

    }

     update = () => {

        const currentTime = performance.now() / 1000;

        this._deltaTime = (currentTime - this._lastFrameTime) ;

        this._lastFrameTime = currentTime;

        requestAnimationFrame(this.update)

    }

}
export const $TIME = Time.Instance;