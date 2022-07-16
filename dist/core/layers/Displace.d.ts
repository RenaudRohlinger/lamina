import { Vector3 } from 'three';
import { DisplaceProps, MappingType, NoiseType } from '../../types';
import Abstract from './Abstract';
export default class Displace extends Abstract {
    static u_strength: number;
    static u_scale: number;
    static u_offset: Vector3;
    static vertexShader: string;
    static type: NoiseType;
    static mapping: MappingType;
    constructor(props?: DisplaceProps);
    private static getNoiseFunction;
    private static getMapping;
}
