import { FresnelProps } from '../../types';
import Abstract from './Abstract';
export default class Fresnel extends Abstract {
    static u_color: string;
    static u_alpha: number;
    static u_bias: number;
    static u_intensity: number;
    static u_power: number;
    static u_factor: number;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: FresnelProps);
}
