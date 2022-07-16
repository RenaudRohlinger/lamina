import { GradientProps, MappingType } from '../../types';
import Abstract from './Abstract';
export default class Gradient extends Abstract {
    static u_colorA: string;
    static u_colorB: string;
    static u_alpha: number;
    static u_start: number;
    static u_end: number;
    static u_contrast: number;
    static vertexShader: string;
    static fragmentShader: string;
    static axes: 'x' | 'y' | 'z';
    static mapping: MappingType;
    constructor(props?: GradientProps);
    private static getMapping;
}
