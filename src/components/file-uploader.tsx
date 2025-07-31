import React from "react";

interface FileUploaderProps {

    onFileChange: (files: FileList | null) => void;
    className?: string;
}


export const FileUploader: React.FC<FileUploaderProps> = ({
                                                              onFileChange,
                                                              className = ''
                                                          }) => (
    <div className={`text-center p-4 ${className}`}>
        <label
            className="text-white bg-gray-700 hover:bg-gray-500 focus:outline-none
                 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm
                 px-5 py-2.5 dark:bg-gray-800 dark:hover:bg-gray-700
                 dark:focus:ring-gray-700 dark:border-gray-700 m-4 cursor-pointer"
            htmlFor="file-input"
        >
            Load Model
        </label>
        <input
            style={{display: "none"}}
            type="file"
            id="file-input"
            multiple
            accept=".obj"
            onChange={(e) => onFileChange(e.target.files)}
        />
    </div>
);