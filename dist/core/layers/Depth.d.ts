import { Vector3 } from 'three';
import { DepthProps } from '../../types';
import Abstract from './Abstract';
export default class Depth extends Abstract {
    static u_near: number;
    static u_far: number;
    static u_origin: Vector3;
    static u_colorA: string;
    static u_colorB: string;
    static u_alpha: number;
    static vertexShader: string;
    static fragmentShader: string;
    static mapping: 'vector' | 'world' | 'camera';
    constructor(props?: DepthProps);
}
