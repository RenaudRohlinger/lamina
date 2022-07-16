import { Node, MeshPhongMaterialProps, MeshPhysicalMaterialProps, MeshToonMaterialProps, MeshBasicMaterialProps, MeshLambertMaterialProps, MeshStandardMaterialProps } from '@react-three/fiber';
import React from 'react';
import { DepthProps, ColorProps, LayerMaterialProps, NoiseProps, FresnelProps, GradientProps, MatcapProps, TextureProps, DisplaceProps, NormalProps, ShaderProps } from '../types';
import * as LAYERS from '../vanilla';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            layerMaterial: Node<LAYERS.LayerMaterial, typeof LAYERS.LayerMaterial>;
            depth_: Node<LAYERS.Depth, typeof LAYERS.Depth>;
            color_: Node<LAYERS.Color, typeof LAYERS.Color>;
            noise_: Node<LAYERS.Noise, typeof LAYERS.Noise>;
            fresnel_: Node<LAYERS.Fresnel, typeof LAYERS.Fresnel>;
            gradient_: Node<LAYERS.Gradient, typeof LAYERS.Gradient>;
            matcap_: Node<LAYERS.Matcap, typeof LAYERS.Matcap>;
            texture_: Node<LAYERS.Texture, typeof LAYERS.Texture>;
            displace_: Node<LAYERS.Displace, typeof LAYERS.Displace>;
            normal_: Node<LAYERS.Normal, typeof LAYERS.Normal>;
            shader_: Node<LAYERS.Shader, typeof LAYERS.Shader>;
        }
    }
}
declare type AllMaterialProps = MeshPhongMaterialProps & //
MeshPhysicalMaterialProps & MeshToonMaterialProps & MeshBasicMaterialProps & MeshLambertMaterialProps & MeshStandardMaterialProps;
declare const LayerMaterial: React.ForwardRefExoticComponent<Pick<React.PropsWithChildren<LayerMaterialProps & Omit<AllMaterialProps, "color">>, "alpha" | "map" | "color" | "lighting" | "name" | "visible" | "key" | "type" | "specular" | "shininess" | "emissive" | "emissiveIntensity" | "emissiveMap" | "bumpMap" | "bumpScale" | "normalMap" | "normalMapType" | "normalScale" | "displacementMap" | "displacementScale" | "displacementBias" | "specularMap" | "envMap" | "combine" | "reflectivity" | "refractionRatio" | "wireframeLinecap" | "wireframeLinejoin" | "flatShading" | "opacity" | "lightMap" | "lightMapIntensity" | "aoMap" | "aoMapIntensity" | "alphaMap" | "wireframe" | "wireframeLinewidth" | "alphaTest" | "alphaToCoverage" | "blendDst" | "blendDstAlpha" | "blendEquation" | "blendEquationAlpha" | "blending" | "blendSrc" | "blendSrcAlpha" | "clipIntersection" | "clippingPlanes" | "clipShadows" | "colorWrite" | "defines" | "depthFunc" | "depthTest" | "depthWrite" | "fog" | "polygonOffset" | "polygonOffsetFactor" | "polygonOffsetUnits" | "precision" | "premultipliedAlpha" | "dithering" | "side" | "shadowSide" | "toneMapped" | "transparent" | "vertexColors" | "stencilWrite" | "stencilFunc" | "stencilRef" | "stencilWriteMask" | "stencilFuncMask" | "stencilFail" | "stencilZFail" | "stencilZPass" | "userData" | "clearcoat" | "clearcoatMap" | "clearcoatRoughness" | "clearcoatRoughnessMap" | "clearcoatNormalScale" | "clearcoatNormalMap" | "ior" | "sheen" | "sheenColor" | "sheenRoughness" | "transmission" | "transmissionMap" | "attenuationDistance" | "attenuationColor" | "specularIntensity" | "specularColor" | "specularIntensityMap" | "specularColorMap" | "roughness" | "metalness" | "roughnessMap" | "metalnessMap" | "envMapIntensity" | "gradientMap" | "dispose" | "attach" | "args" | "children" | "onUpdate" | "clone" | "copy" | "id" | "uuid" | "toJSON" | "addEventListener" | "hasEventListener" | "removeEventListener" | "dispatchEvent" | "isMaterial" | "needsUpdate" | "version" | "onBeforeCompile" | "customProgramCacheKey" | "setValues" | "sheenColorMap" | "sheenRoughnessMap" | "thickness" | "thicknessMap" | "isMeshStandardMaterial" | "metal"> & React.RefAttributes<LAYERS.LayerMaterial>>;
declare const Depth: React.ForwardRefExoticComponent<DepthProps & React.RefAttributes<LAYERS.Depth>>;
declare const Color: React.ForwardRefExoticComponent<ColorProps & React.RefAttributes<LAYERS.Color>>;
declare const Noise: React.ForwardRefExoticComponent<NoiseProps & React.RefAttributes<LAYERS.Noise>>;
declare const Fresnel: React.ForwardRefExoticComponent<FresnelProps & React.RefAttributes<LAYERS.Fresnel>>;
declare const Gradient: React.ForwardRefExoticComponent<GradientProps & React.RefAttributes<LAYERS.Gradient>>;
declare const Matcap: React.ForwardRefExoticComponent<MatcapProps & React.RefAttributes<LAYERS.Matcap>>;
declare const Texture: React.ForwardRefExoticComponent<TextureProps & React.RefAttributes<LAYERS.Texture>>;
declare const Displace: React.ForwardRefExoticComponent<DisplaceProps & React.RefAttributes<LAYERS.Displace>>;
declare const Normal: React.ForwardRefExoticComponent<NormalProps & React.RefAttributes<LAYERS.Normal>>;
declare const Shader: React.ForwardRefExoticComponent<ShaderProps & React.RefAttributes<LAYERS.Shader>>;
export { LayerMaterial, Depth, Color, Noise, Fresnel, Gradient, Matcap, Texture, Displace, Normal, Shader };
