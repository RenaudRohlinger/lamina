import { ShaderProps } from '../../types';
import Abstract from './Abstract';
export default class Shader extends Abstract {
    _fragment: string;
    _vertex: string;
    constructor(props?: ShaderProps);
    set fragment(v: string);
    get fragment(): string;
    set vertex(v: string);
    get vertex(): string;
    get(target: this, name: string): this[keyof this];
    set(target: this, name: string, val: any): boolean;
}
