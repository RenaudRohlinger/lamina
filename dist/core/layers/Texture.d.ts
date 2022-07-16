import { TextureProps } from '../../types';
import Abstract from './Abstract';
export default class Texture extends Abstract {
    static u_alpha: number;
    static u_map: null;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: TextureProps);
}
