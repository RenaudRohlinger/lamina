import React, { useMemo } from 'react'
import { GroupProps, useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import { Sphere } from '@react-three/drei'
import { LayerBlendMode } from '../../../src/types'
import useSphereControls from './useSphereControls'
import { LayerMaterial, Base, Depth, Fresnel, Noise } from 'lamina'

export default function Spheres() {
  const viewport = useThree((s) => s.viewport)
  const RandomProps = useMemo<GroupProps[]>(
    () =>
      new Array(30).fill(0).map(() => {
        return {
          position: [
            MathUtils.randFloat(-viewport.width, viewport.width), //
            MathUtils.randFloat(-viewport.height, viewport.height),
            MathUtils.randFloat(-20, 5),
          ],
          rotation: [
            MathUtils.randFloat(-10, 10), //
            MathUtils.randFloat(-10, 10),
            MathUtils.randFloat(-20, 10),
          ],
          scale: MathUtils.randFloat(0.05, 1),
        }
      }),
    [viewport]
  )

  const {
    GradientStrength,
    GradientBlendMode,
    GradientColorA,
    GradientColorB,

    GrainBlendMode,
    GrainColor,
    GrainStrength,

    FresnelBlendMode,
    FresnelColor,
    FresnelStrength,

    BaseStrength,
    BaseColor,
    BaseBlendMode,
  } = useSphereControls()

  return (
    <>
      {RandomProps.map((props, i) => (
        <group {...props} key={'Sphere-' + i}>
          <Sphere args={[1, 128, 64]}>
            <LayerMaterial>
              <Base color={BaseColor} alpha={BaseStrength} mode={BaseBlendMode as LayerBlendMode} />
              <Depth
                colorA={GradientColorA}
                colorB={GradientColorB}
                alpha={GradientStrength}
                mode={GradientBlendMode as LayerBlendMode}
                near={0}
                far={2}
                origin={[1, 1, 1]}
              />
              <Fresnel
                color={FresnelColor}
                alpha={1}
                mode={FresnelBlendMode as LayerBlendMode}
                intensity={FresnelStrength * 2}
                scale={1}
                bias={0.1}
              />
              <Noise color={GrainColor} alpha={GrainStrength} mode={GrainBlendMode as LayerBlendMode} scale={1} />
            </LayerMaterial>
          </Sphere>
        </group>
      ))}
    </>
  )
}
