import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";


export class Input {

 altKeyPressed : boolean = false;
 pointerLocked: boolean = false;
 middleMouseButtonPressed: boolean = false;
 canvas: HTMLCanvasElement;
 movementX: number = 0;
 movementY: number = 0;
 mouseMoving: boolean = false;

 constructor() {

     this.canvas = $WGPU.canvas
     this.canvas.onmousemove = async (e) => {
         this.movementX = e.movementX;
         this.movementY = e.movementY;
            this.mouseMoving = true;
     }


     document.onkeydown = (e) => {

      this.altKeyPressed = e.altKey
  }

  document.onkeyup = async (e) => {
      this.altKeyPressed = e.altKey


  }

  document.onmousedown = (e) => {
        if (e.button === 1) { // Middle mouse button
            this.middleMouseButtonPressed = true;
        }
  }

      document.onmouseup = (e) => {
        if (e.button === 1) { // Middle mouse button
            this.middleMouseButtonPressed = false;

        }
      }



 }

 async update() {

     if( this.middleMouseButtonPressed) {
            if (!this.pointerLocked) {
                await this.canvas.requestPointerLock();
                this.pointerLocked = true;
            }
            if (this.mouseMoving) {
                $WGPU.mainCamera.rotateAroundTarget(this.movementX, this.movementY)
            }
     }

     if(this.altKeyPressed) {
         if (!this.pointerLocked) {
             await this.canvas.requestPointerLock();
             this.pointerLocked = true;
         }
         if (this.mouseMoving)
         {
             $WGPU.mainCamera.rotate(this.movementX, this.movementY);
        }
         //console.log(e.movementY)
     }

     if (this.pointerLocked && !this.middleMouseButtonPressed && !this.altKeyPressed) {
         document.exitPointerLock();
         this.pointerLocked = false;
     }

    this.mouseMoving = false;

 }

}
