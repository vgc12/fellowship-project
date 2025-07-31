import React from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {ThreeDot} from "react-loading-indicators";

interface LoadingDialogProps {
    isOpen: boolean;
    isLoading: boolean;
    children?: React.ReactNode;
}

export const LoadingDialog: React.FC<LoadingDialogProps> = ({
                                                                isOpen,
                                                                isLoading,
                                                                children
                                                            }) => (
    <Dialog open={isOpen}>
        <DialogContent showCloseButton={false}>
            <DialogHeader>
                <DialogTitle>
                    {isLoading ? 'Loading...' : 'Select a Scene'}
                </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center justify-center">
                {isLoading ? (
                    <ThreeDot size="small" color="#000000"/>
                ) : (
                    children
                )}
            </DialogDescription>
        </DialogContent>
    </Dialog>
);