import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Sphere } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import { Color, Depth, Fresnel, Gradient, LayerMaterial, Shader } from 'lamina'
import {LaminaDebugger} from 'lamina/debug'
import { useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Stats } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'

function Thing() {
  const [state, set] = useState(0)

  const strength = useRef(0)
  const displaceRef = useRef({strengh: 0, offset: new Vector3()})

  useFrame(({ clock }, dt) => {
    if (displaceRef.current.strength !== strength.current) {
      displaceRef.current.strength = MathUtils.lerp(
        displaceRef.current.strength, //
        strength.current,
        0.1
      )
    }

    // if (strength.current > 0) {
      displaceRef.current.offset.x += 0.3 * dt
    // }
  })

  return (
    <Sphere
      onPointerEnter={() => set(1)} //
      onPointerLeave={() => set(0)}
    >
      <LaminaDebugger>
      <LayerMaterial lighting="basic" roughness={1}>
          <Color color="red" />
          <Fresnel mode='add' />
          <Shader
            name='Noise'
            ref={displaceRef}
              vertex ={`
       
              uniform float u_strength;
              uniform float u_scale;
              uniform vec3 u_offset;
        
              vec3 displace(vec3 p) {
                vec3 f_position = lamina_mapping_template;
                float f_n = lamina_noise_template((f_position + 1.) * u_scale);
                vec3 f_newPosition = p + (f_n * normal);
        
                return f_newPosition;
              }
        
              
              vec3 orthogonal(vec3 v) {
                return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
                : vec3(0.0, -v.z, v.y));
              }
              vec3 recalcNormals(vec3 newPos) {
                float offset = 0.001;
                vec3 tangent = orthogonal(normal);
                vec3 bitangent = normalize(cross(normal, tangent));
                vec3 neighbour1 = position + tangent * offset;
                vec3 neighbour2 = position + bitangent * offset;
                vec3 displacedNeighbour1 = displace(neighbour1);
                vec3 displacedNeighbour2 = displace(neighbour2);
                vec3 displacedTangent = displacedNeighbour1 - newPos;
                vec3 displacedBitangent = displacedNeighbour2 - newPos;
                return normalize(cross(displacedTangent, displacedBitangent));
              }
          
          
              void main() {
               
                vec3 f_newPosition = displace(position);
                lamina_finalNormal = recalcNormals(f_newPosition);
        
                return f_newPosition;
              }
            `
        }
          
          fragment={`
            uniform vec3 u_color;
            uniform float u_alpha;

            void main() {
              return vec4(u_color, u_alpha);
            }  
          `}
          u_color={new THREE.Color('green')}
          u_offset={new THREE.Vector3()}
          u_alpha={1.}
          scale={1}
          onShaderParse={(self) => {
            function getNoiseFunction(type) {
              switch (type) {
                default:
                case 'perlin':
                  return `lamina_noise_perlin`
                case 'simplex':
                  return `lamina_noise_simplex`
                case 'cell':
                  return `lamina_noise_worley`
                case 'white':
                  return `lamina_noise_white`
                case 'curl':
                  return `lamina_noise_swirl`
              }
            }
    
            function getMapping(type) {
              switch (type) {
                default:
                case 'local':
                  return `position`
                case 'world':
                  return `(modelMatrix * vec4(position,1.0)).xyz`
                case 'uv':
                  return `vec3(uv, 0.)`
              }
            }
    
            self.schema.push({
              value: self.type,
              label: 'type',
              options: ['perlin', 'simplex', 'cell', 'curl', 'white'],
            })
    
            self.schema.push({
              value: self.mapping,
              label: 'mapping',
              options: ['local', 'world', 'uv'],
            })
    
            const noiseFunc = getNoiseFunction(self.type)
            const mapping = getMapping(self.mapping)
    
            console.log(self)
            self.vertexVariables = self.vertexVariables.replace('lamina_mapping_template', mapping)
            self.vertexVariables = self.vertexVariables.replace('lamina_noise_template', noiseFunc)
          }} 
          mode="add"
        />
        </LayerMaterial>
        </LaminaDebugger>
    </Sphere>
  )
}

export default function App() {
  return (
    <>
      <Stats />
      <Canvas
        camera={{
          position: [2, 2, 2],
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="sunset" />
        </Suspense>

        <Thing />

        <gridHelper />
        <OrbitControls />
      </Canvas>
    </>
  )
}
