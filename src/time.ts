export class Time {
    get deltaTime(): number {
        return this._deltaTime;
    }

    private static _instance: Time | undefined;

    private _lastFrameTime: number;
    private _deltaTime: number;

    static get Instance() {
        if (!this._instance) {
            this._instance = new Time();
            this._instance.initialize();
        }
        return this._instance;
    }


    async initialize() {
        this._deltaTime = 0;
        this._lastFrameTime = 0;
        requestAnimationFrame(this.update);
    }

    private update = async () => {
        const currentTime = performance.now();
        this._deltaTime = (currentTime - this._lastFrameTime) / 1000;
        //console.log(`Current Time ${currentTime} delta time ${this.deltaTime} last frame time ${this._lastFrameTime}`)
        this._lastFrameTime = currentTime;

       // console.log(performance.now()/1000)

        requestAnimationFrame(this.update)
    }

}
export const $TIME = Time.Instance;