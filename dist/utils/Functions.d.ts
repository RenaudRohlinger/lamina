import { LayerMaterialProps } from '../types';
export declare function isBlobUrl(url: string): boolean;
export declare function isValidHttpUrl(url: string): boolean;
export declare function isDataUrl(url: string): boolean;
export declare function toDataUrl(url: string, callback: (data: string) => void): void;
export declare function isTextureSrc(src: string): boolean;
export declare function getUniform(value: any): any;
export declare function getSpecialParameters(label: string): {
    min: number;
    max: number;
    image?: undefined;
} | {
    min: number;
    max?: undefined;
    image?: undefined;
} | {
    image: undefined;
    min?: undefined;
    max?: undefined;
} | {
    min?: undefined;
    max?: undefined;
    image?: undefined;
};
export declare function getLayerMaterialArgs({ color, alpha, lighting, name, ...rest }?: LayerMaterialProps & any): any;
export declare function isSerializableType(prop: any): boolean;
export declare function serializeProp(prop: any): any;
