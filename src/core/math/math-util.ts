export function convertToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

export function convertToDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}