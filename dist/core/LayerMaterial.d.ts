import Abstract from './layers/Abstract';
import Depth from './layers/Depth';
import Color from './layers/Color';
import Noise from './layers/Noise';
import Fresnel from './layers/Fresnel';
import Gradient from './layers/Gradient';
import Matcap from './layers/Matcap';
import Texture from './layers/Texture';
import Displace from './layers/Displace';
import Normal from './layers/Normal';
import Shader from './layers/Shader';
import { LayerMaterialParameters, SerializedBase, ShadingType } from '../types';
import { ColorRepresentation, MeshBasicMaterialParameters, MeshLambertMaterialParameters, MeshPhongMaterialParameters, MeshPhysicalMaterialParameters, MeshStandardMaterialParameters, MeshToonMaterialParameters } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
declare type AllMaterialParams = MeshPhongMaterialParameters | MeshPhysicalMaterialParameters | MeshToonMaterialParameters | MeshBasicMaterialParameters | MeshLambertMaterialParameters | MeshStandardMaterialParameters;
declare class LayerMaterial extends CustomShaderMaterial {
    layers: Abstract[];
    lighting: ShadingType;
    __lamina__debuggerNeedsUpdate: boolean;
    constructor({ color, alpha, lighting, layers, ...props }?: LayerMaterialParameters & AllMaterialParams);
    genShaders(): {
        uniforms: any;
        vertexShader: string;
        fragmentShader: string;
    };
    refresh(): void;
    serialize(): SerializedBase;
    set color(v: ColorRepresentation);
    get color(): ColorRepresentation;
    set alpha(v: number);
    get alpha(): number;
    toJSON(meta?: any): any;
}
export { LayerMaterial, Abstract, Depth, Color, Noise, Fresnel, Gradient, Matcap, Texture, Displace, Normal, Shader };
