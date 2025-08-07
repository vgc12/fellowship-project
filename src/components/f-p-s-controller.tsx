import {useFpsControl} from "@/components/use-fps-control.tsx";
import {useCallback} from "react";
import Joystick, {DirectionCount, type IJoystickChangeValue} from "rc-joystick";

export const FPSController = () => {

    const {onJoystickChange, setRunning} = useFpsControl();


    const activeChanged = useCallback((c: boolean) => setRunning(c), [setRunning]);

    const changed = (jv: IJoystickChangeValue) => onJoystickChange(jv);


    return (<div className=" flex justify-center items-center ">
        <div className="items-center flex flex-col gap-4">
            <Joystick baseRadius={40} controllerRadius={20} autoReset={true}
                      className={'!box-content dark:!bg-gray-800 !bg-gray-100'}
                      onActiveChange={activeChanged} directionCount={DirectionCount.Five}
                      onChange={changed}>
            </Joystick>

        </div>
    </div>)
}