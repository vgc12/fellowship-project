import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";


export class Input {

 altKeyPressed : boolean = false;
 pointerLocked: boolean = false;
 middleMouseButtonPressed: boolean = false;
 constructor() {

     const canvas = $WGPU.canvas
     canvas.onmousemove = async (e) => {
         //console.log(e.movementX, e.movementY)

      if( this.middleMouseButtonPressed) {
       $WGPU.mainCamera.rotateAroundTarget(e.movementX, e.movementY)
      }
      if(this.altKeyPressed) {
       if (!this.pointerLocked) {
        await canvas.requestPointerLock();
        this.pointerLocked = true;
       }
       $WGPU.mainCamera.rotate(e.movementX, e.movementY);
       //console.log(e.movementY)
      }
     }

     document.onkeydown = (e) => {

      this.altKeyPressed = e.altKey;
  }

  document.onkeyup = async (e) => {
      this.altKeyPressed = e.altKey;

      if (!this.altKeyPressed && this.pointerLocked) {
        document.exitPointerLock()
        this.pointerLocked = false;
      }

  }

  document.onmousedown = (e) => {
        if (e.button === 1) { // Middle mouse button
            this.middleMouseButtonPressed = true;
        }
  }

      document.onmouseup = (e) => {
        if (e.button === 1) { // Middle mouse button
            this.middleMouseButtonPressed = false;
            if (this.pointerLocked) {
                document.exitPointerLock();
                this.pointerLocked = false;
            }
        }
      }



 }

}
