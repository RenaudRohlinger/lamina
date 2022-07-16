import { IUniform } from 'three';
import { BlendMode, LayerProps, SerializedLayer } from '../../types';
export default class Abstract {
    uuid: string;
    name: string;
    mode: BlendMode;
    visible: boolean;
    uniforms: {
        [key: string]: IUniform<any>;
    };
    onUniformsParse?: (self: Abstract & any) => {
        [key: string]: IUniform<any>;
    } | void;
    onNonUniformsParse?: (self: Abstract & any) => {
        [key: string]: any;
    } | void;
    onShaderParse?: (self: Abstract & any) => void;
    fragmentShader: string;
    vertexShader: string;
    vertexVariables: string;
    fragmentVariables: string;
    raw: {
        fragment: string;
        vertex: string;
        constructor: new () => Abstract;
        uniforms: {
            [key: string]: IUniform<any>;
        };
        nonUniforms: {
            [key: string]: any;
        };
    };
    schema: {
        value: any;
        label: any;
        options?: any[];
    }[];
    __updateMaterial?: () => void;
    constructor(c: new () => Abstract, props?: LayerProps | null);
    init(): void;
    buildUniforms(): void;
    buildNonUniforms(): void;
    buildShaders(): void;
    renameTokens(name: string): string;
    processFinal(shader: string, isVertex?: boolean): string;
    getShaderFromIndex(tokens: any, index: number[]): any;
    getBlendMode(b: string, a: string): string;
    getHash(): string;
    getSchema(): ({
        value: any;
        min: number;
        max: number;
        image?: undefined;
        label: any;
        options: any[] | undefined;
    } | {
        value: any;
        min: number;
        max?: undefined;
        image?: undefined;
        label: any;
        options: any[] | undefined;
    } | {
        value: any;
        image: undefined;
        min?: undefined;
        max?: undefined;
        label: any;
        options: any[] | undefined;
    } | {
        value: any;
        min?: undefined;
        max?: undefined;
        image?: undefined;
        label: any;
        options: any[] | undefined;
    })[];
    serialize(): SerializedLayer;
}
