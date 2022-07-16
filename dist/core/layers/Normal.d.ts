import { Vector3 } from 'three';
import { NormalProps } from '../../types';
import Abstract from './Abstract';
export default class Normal extends Abstract {
    static u_alpha: number;
    static u_direction: Vector3;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: NormalProps);
}
