import { ColorProps } from '../../types';
import Abstract from './Abstract';
export default class Color extends Abstract {
    static u_color: string;
    static u_alpha: number;
    static fragmentShader: string;
    constructor(props?: ColorProps);
}
