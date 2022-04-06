import { extend, Node, useLoader } from '@react-three/fiber'
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import mergeRefs from 'react-merge-refs'
import {
  DepthProps,
  ColorProps,
  LayerMaterialProps,
  NoiseProps,
  FresnelProps,
  GradientProps,
  MatcapProps,
  TextureProps,
  DisplaceProps,
  NormalProps,
  LayerProps,
  ShaderProps,
} from './types'
import * as LAYERS from './vanilla'
import DebugLayerMaterial from './debug'
import { getLayerMaterialArgs } from './utils/Functions'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      layerMaterial: Node<LAYERS.LayerMaterial, typeof LAYERS.LayerMaterial>
      debuglayerMaterial: Node<typeof DebugLayerMaterial, typeof DebugLayerMaterial>
      depth_: Node<LAYERS.Depth, typeof LAYERS.Depth>
      color_: Node<LAYERS.Color, typeof LAYERS.Color>
      noise_: Node<LAYERS.Noise, typeof LAYERS.Noise>
      fresnel_: Node<LAYERS.Fresnel, typeof LAYERS.Fresnel>
      gradient_: Node<LAYERS.Gradient, typeof LAYERS.Gradient>
      matcap_: Node<LAYERS.Matcap, typeof LAYERS.Matcap>
      texture_: Node<LAYERS.Texture, typeof LAYERS.Texture>
      displace_: Node<LAYERS.Displace, typeof LAYERS.Displace>
      normal_: Node<LAYERS.Normal, typeof LAYERS.Normal>
      shader_: Node<LAYERS.Shader, typeof LAYERS.Shader>
    }
  }
}

extend({
  LayerMaterial: LAYERS.LayerMaterial,
  Depth_: LAYERS.Depth,
  Color_: LAYERS.Color,
  Noise_: LAYERS.Noise,
  Fresnel_: LAYERS.Fresnel,
  Gradient_: LAYERS.Gradient,
  Matcap_: LAYERS.Matcap,
  Texture_: LAYERS.Texture,
  Displace_: LAYERS.Displace,
  Normal_: LAYERS.Normal,
  Shader_: LAYERS.Shader,
})

const LayerMaterial = React.forwardRef<LAYERS.LayerMaterial, React.PropsWithChildren<LayerMaterialProps>>(
  ({ children, debug, ...props }, forwardRef) => {
    const ref = React.useRef<LAYERS.LayerMaterial>(null!)

    React.useLayoutEffect(() => {
      ref.current.layers = (ref.current as any).__r3f.objects
      ref.current.refresh()
    }, [children])

    const [args, otherProps] = useMemo(() => getLayerMaterialArgs(props), [props])

    return debug ? (
      <DebugLayerMaterial ref={mergeRefs([ref, forwardRef])} {...args} {...otherProps}>
        {children}
      </DebugLayerMaterial>
    ) : (
      <layerMaterial args={[args]} ref={mergeRefs([ref, forwardRef])} {...otherProps}>
        {children}
      </layerMaterial>
    )
  }
)

function getNonUniformArgs(props: any) {
  return [
    {
      mode: props?.mode,
      visible: props?.visible,
      type: props?.type,
      mapping: props?.mapping,
      map: props?.map,
      axes: props?.axes,
      onParse: props?.onParse,
    },
  ] as any
}

const Depth = React.forwardRef<LAYERS.Depth, DepthProps>((props, forwardRef) => {
  return <depth_ args={getNonUniformArgs(props)} ref={forwardRef} {...props} />
}) as React.ForwardRefExoticComponent<DepthProps & React.RefAttributes<LAYERS.Depth>>

const Color = React.forwardRef<LAYERS.Color, ColorProps>((props, ref) => {
  return <color_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<ColorProps & React.RefAttributes<LAYERS.Color>>

const Noise = React.forwardRef<LAYERS.Noise, NoiseProps>((props, ref) => {
  return <noise_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<NoiseProps & React.RefAttributes<LAYERS.Noise>>

const Fresnel = React.forwardRef<LAYERS.Fresnel, FresnelProps>((props, ref) => {
  return <fresnel_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<FresnelProps & React.RefAttributes<LAYERS.Fresnel>>

const Gradient = React.forwardRef<LAYERS.Gradient, GradientProps>((props, ref) => {
  return <gradient_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<GradientProps & React.RefAttributes<LAYERS.Gradient>>

const Matcap = React.forwardRef<LAYERS.Matcap, MatcapProps>((props, ref) => {
  return <matcap_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<MatcapProps & React.RefAttributes<LAYERS.Matcap>>

const Texture = React.forwardRef<LAYERS.Texture, TextureProps>((props, ref) => {
  return <texture_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<TextureProps & React.RefAttributes<LAYERS.Texture>>

const Displace = React.forwardRef<LAYERS.Displace, DisplaceProps>((props, ref) => {
  return <displace_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<DisplaceProps & React.RefAttributes<LAYERS.Displace>>

const Normal = React.forwardRef<LAYERS.Normal, NormalProps>((props, ref) => {
  return <normal_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<NormalProps & React.RefAttributes<LAYERS.Normal>>

const Shader = React.forwardRef<LAYERS.Shader, ShaderProps>((props, ref) => {
  return <shader_ ref={ref} args={getNonUniformArgs(props)} {...props} />
}) as React.ForwardRefExoticComponent<ShaderProps & React.RefAttributes<LAYERS.Shader>>

function useLamina(url: string) {
  const material = useLoader(LAYERS.LaminaLoader as any, url) as LAYERS.LayerMaterial

  return React.forwardRef<LAYERS.LayerMaterial, Omit<LayerMaterialProps, 'ref'>>((props, forwardRef) => {
    const ref = useRef<LAYERS.LayerMaterial>(null!)

    return (
      <LayerMaterial ref={mergeRefs([ref, forwardRef])} {...material.serialize().properties} {...props}>
        {material.layers.map((e) => (
          <primitive key={e.uuid} object={e} />
        ))}
        {props.children}
      </LayerMaterial>
    )
  })
}

function useLaminaLayer<T extends LayerProps>(url: string) {
  const layer = useLoader(LAYERS.LaminaLoader as any, url) as LAYERS.Abstract

  return React.forwardRef<LAYERS.Abstract, T>((props, ref) => {
    return <primitive ref={ref} object={layer} {...props} />
  })
}

export {
  useLamina,
  useLaminaLayer,
  DebugLayerMaterial,
  LayerMaterial,
  Depth,
  Color,
  Noise,
  Fresnel,
  Gradient,
  Matcap,
  Texture,
  Displace,
  Normal,
  Shader,
}
