import { App } from './app.ts';



const canvas = document.getElementById('canvas-main') as HTMLCanvasElement;
const app = new App(canvas);
await app.initialize();


app.run();
