import type {Scene} from "@/app/scene.ts";
import {$SCENE_MANAGER} from "@/app/scene-manager.ts";
import {TbSandbox} from "react-icons/tb";

import {FaSpaceShuttle} from "react-icons/fa";
import type {ReactElement} from "react";
import {BsDoorOpenFill} from "react-icons/bs";
import {RiRobot2Line} from "react-icons/ri";
import {UseCssClass} from "@/components/use-css-class.tsx";

interface SceneNavigatorProps {
    activeScene: Scene | null;
    isLoading: boolean;
    setActiveScene: (id: string) => void;
    vertical?: boolean;
    onClick?: () => void;
}

const sceneIconMap: { [key: string]: ReactElement } = {}

export const SceneNavigator = (props: SceneNavigatorProps) =>
{

    const iconSize = '3vh'
    const classes = 'dark:text-white text-black'

    sceneIconMap['SandBoxScene'] = <TbSandbox className={classes} size={iconSize}/>
    sceneIconMap['SpaceScene'] = <FaSpaceShuttle className={classes} size={iconSize}/>
    sceneIconMap['RoomScene'] = <BsDoorOpenFill className={classes} size={iconSize}/>
    sceneIconMap['RobotScene'] = <RiRobot2Line className={classes} size={iconSize}/>
    const components =
        $SCENE_MANAGER.scenes.map((scn) =>
        {
            return (
                <>

                    <SceneButtonComponent icon={sceneIconMap[scn.constructor.name]}
                                          vertical={props.vertical ?? false} onClick={props.onClick}
                                          key={scn.guid} sceneName={scn.name}
                                          sceneGUID={scn.guid}
                                          activeSceneName={props.activeScene != null ? props.activeScene.name : ''}
                                          setActiveScene={props.setActiveScene}>

                    </SceneButtonComponent>
                </>)
        })

    const output = props.vertical ?
        <div className={`flex flex-col justify-start `}>
            {components}
        </div> : <>{components}</>

    return (
        output
    );
};

type SceneButtonComponentProps = {
    sceneName: string;
    sceneGUID: string;
    activeSceneName: string;
    icon: ReactElement;
    setActiveScene: (id: string) => void;
    vertical: boolean
    onClick?: () => void;
}

const SceneButtonComponent = (props: SceneButtonComponentProps) =>
{
    const {sceneName, activeSceneName, sceneGUID, icon, vertical, setActiveScene, onClick} = props;

    const {buttonLightSquare} = UseCssClass();

    return (
        <button
            key={sceneName}
            onClick={() =>
            {
                onClick?.();
                setActiveScene(sceneGUID)
            }}
            className={buttonLightSquare}
            title={sceneName}
        >

            {icon}

        </button>
    )
}