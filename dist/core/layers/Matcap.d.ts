import { MatcapProps } from '../../types';
import Abstract from './Abstract';
export default class Matcap extends Abstract {
    static u_alpha: number;
    static u_map: undefined;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: MatcapProps);
}
