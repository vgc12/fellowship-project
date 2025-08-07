import React, {useEffect, useState} from "react";
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, Move, RotateCcw} from "lucide-react";
import {FPSController, OrbitController} from "@/components/orbit-controller.tsx";
import {Panel} from "@/components/panel.tsx";
import {$WGPU} from "@/core/webgpu/webgpu-singleton.ts";
import {Slider} from "@/components/slider.tsx";
import {$INPUT} from "@/Controls/input.ts";


export const CameraController: React.FC = () => {
    const [mode, setMode] = useState('orbit');

    const [sensitivity, setSensitivity] = useState($INPUT.sensitivity);

    useEffect(() => {
        $INPUT.sensitivity = sensitivity;
    }, [sensitivity]);


    return (

        <Panel className={'shrink'} label='Camera Controller'>

            <div className="space-y-6">

                <div className="flex bg-gray-300 dark:bg-gray-900 rounded-xl p-1">
                    {[
                        {key: 'orbit', icon: RotateCcw, label: 'Orbit'},
                        {key: 'fps', icon: Eye, label: 'FPS'},
                        {key: 'pan', icon: Move, label: 'Pan'}
                    ].map(({key, icon: Icon, label}) => (
                        <button
                            key={key}
                            onClick={() => setMode(key)}
                            className={`  flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium  ${
                                mode === key
                                    ? 'dark:bg-gray-600 bg-gray-100 shadow-sm'
                                    : ' dark:bg-gray-900 bg-gray-300 hover:text-gray-100 dark:hover:text-gray-900'
                            }`}
                        >
                            <Icon className="w-4 h-4"/>
                            {label}
                        </button>
                    ))}
                </div>


                <div className="dark:bg-gray-700 bg-gray-300 rounded-xl p-4">
                    {mode === 'orbit' && (
                        <OrbitController/>
                    )}

                    {mode === 'fps' && (
                        <FPSController/>
                    )}

                    {mode === 'pan' && (
                        <div className="flex justify-center">
                            <div className="grid grid-cols-3 gap-2">
                                <div></div>
                                <button className="bg-white hover:bg-gray-50 p-4 rounded-lg shadow">
                                    <ArrowUp className="w-5 h-5 text-gray-700"/>
                                </button>
                                <div></div>
                                <button className="bg-white hover:bg-gray-50 p-4 rounded-lg shadow">
                                    <ArrowLeft className="w-5 h-5 text-gray-700"/>
                                </button>
                                <button
                                    className="bg-white hover:bg-gray-50 p-4 rounded-lg shadow text-gray-700 font-medium">
                                    ⌂
                                </button>
                                <button className="bg-white hover:bg-gray-50 p-4 rounded-lg shadow">
                                    <ArrowRight className="w-5 h-5 text-gray-700"/>
                                </button>
                                <div></div>
                                <button className="bg-white hover:bg-gray-50 p-4 rounded-lg shadow">
                                    <ArrowDown className="w-5 h-5 text-gray-700"/>
                                </button>
                                <div></div>
                            </div>
                        </div>
                    )}
                </div>
                <h3>Sensitivity</h3>
                <Slider min={0} max={100} defaultValue={[sensitivity]}
                        onValueCommit={val => setSensitivity(val[0])}></Slider>
                <button onClick={$WGPU.cameraController.resetPosition}
                        className="w-full dark:bg-gray-700 bg-gray-300 hover:bg-gray-200  dark:hover:bg-gray-800 py-2 rounded-xl font-medium ">
                    Reset Camera Position
                </button>
            </div>
        </Panel>

    );
}