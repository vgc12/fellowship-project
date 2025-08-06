import React, {useState} from "react";
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, Move, RotateCcw} from "lucide-react";
import {OrbitControllerComponent} from "@/components/orbit-controller-component.tsx";
import {UseCssClass} from "@/components/use-css-class.tsx";


export const CameraController: React.FC = () =>
{
    const [mode, setMode] = useState('orbit');
    const {buttonLightSquare} = UseCssClass();


    const [fpValues, setFpValues] = useState({yaw: 0, pitch: 0});
    const [panValues, setPanValues] = useState({x: 0, y: 0});


    return (

        <div
            className=" dark:text-white text-black dark:bg-gray-900 bg-gray-100 rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className=" text-lg font-semibold mb-4 flex items-center gap-2">
                Camera Controller
            </h3>

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


                <div className="dark:bg-gray-700 bg-gray-300 rounded-xl p-6">
                    {mode === 'orbit' && (
                        <OrbitControllerComponent/>
                    )}

                    {mode === 'fps' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                                <div></div>
                                <button
                                    className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow text-gray-700 font-medium">
                                    W
                                </button>
                                <div></div>
                                <button
                                    className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow text-gray-700 font-medium">
                                    A
                                </button>
                                <button
                                    className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow text-gray-700 font-medium">
                                    S
                                </button>
                                <button
                                    className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow text-gray-700 font-medium">
                                    D
                                </button>
                            </div>
                            <div className="flex justify-center gap-2">
                                <button
                                    className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow text-gray-700 font-medium text-sm">
                                    Q (Up)
                                </button>
                                <button
                                    className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow text-gray-700 font-medium text-sm">
                                    E (Down)
                                </button>
                            </div>
                            <div className="text-center">
                                <div className="bg-white rounded-lg shadow p-3 inline-block">
                                    <div className="text-xs text-gray-500 mb-1">Look Direction</div>
                                    <div className="text-sm text-gray-700">Yaw: {fpValues.yaw}° |
                                        Pitch: {fpValues.pitch}°
                                    </div>
                                </div>
                            </div>
                        </div>
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

                <button
                    className="w-full dark:bg-gray-700 bg-gray-300 hover:bg-gray-200  dark:hover:bg-gray-800 py-3 rounded-xl font-medium ">
                    Reset Camera
                </button>
            </div>
        </div>
    );
}