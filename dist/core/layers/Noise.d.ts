import { Vector3 } from 'three';
import { MappingType, NoiseProps, NoiseType } from '../../types';
import Abstract from './Abstract';
export default class Noise extends Abstract {
    static u_colorA: string;
    static u_colorB: string;
    static u_colorC: string;
    static u_colorD: string;
    static u_alpha: number;
    static u_scale: number;
    static u_offset: Vector3;
    static vertexShader: string;
    static fragmentShader: string;
    static type: NoiseType;
    static mapping: MappingType;
    constructor(props?: NoiseProps);
}
