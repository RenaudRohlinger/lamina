/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useEffect, useRef, useState } from 'react'
import { useGLTF, TransformControls, OrbitControls } from '@react-three/drei'
import * as LAYERS from 'lamina'
import { button, useControls } from 'leva'
import { useLamina, Shader } from 'lamina'
import { Abstract, Shader as ShaderType } from 'lamina/vanilla'
import { extend, useFrame } from '@react-three/fiber'

export default function Monkey() {
  const { nodes, scene } = useGLTF('/monkey.glb') as any
  const orbitControls = React.useRef<any>(null!)
  const transformControls = React.useRef<any>(null!)

  React.useEffect(() => {
    if (transformControls.current) {
      const { current: controls } = transformControls
      const callback = (event: any) => (orbitControls.current.enabled = !event.value)
      controls.addEventListener('dragging-changed', callback)
      return () => controls.removeEventListener('dragging-changed', callback)
    }
  })

  const [layers, setLayers] = useState<any[]>([])
  const InitialMaterial = useLamina('/test2.json')
  const InitialLayer = LAYERS.useLaminaLayer('/test.json')
  const CustomLayerLoaded = LAYERS.useLaminaLayer('/custom.json')

  useControls('Layers', {
    Type: {
      options: [
        'Abstract', //
        'Color',
        'Depth',
        'Displace',
        'Fresnel',
        'Gradient',
        'Matcap',
        'Noise',
        'Texture',
      ],
      value: 'Color',
    },
    Add: button((get) => {
      const k = get('Layers.Type')
      // @ts-ignore
      const Component = LAYERS[k]

      setLayers((s) => [...s, <Component />])
    }),
  })

  return (
    <>
      <TransformControls ref={transformControls}>
        <group scale={0.1} rotation={[0, -Math.PI / 2, Math.PI / 4]}>
          <mesh matrixAutoUpdate geometry={nodes.Suzanne.geometry} rotation-y={Math.PI / 2} scale={30}>
            <InitialMaterial debug>{...layers}</InitialMaterial>
          </mesh>
        </group>
      </TransformControls>
      <OrbitControls ref={orbitControls} />
    </>
  )
}

useGLTF.preload('/monkey.glb')
