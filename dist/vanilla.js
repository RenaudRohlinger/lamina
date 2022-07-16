import * as THREE from 'three';
import { Vector3, Vector2, Vector4, Matrix3, Matrix4, Color as Color$1, Texture as Texture$1, MathUtils } from 'three';
import hash from 'object-hash';
import tokenize from 'glsl-tokenizer';
import descope from 'glsl-token-descope';
import stringify from 'glsl-token-string';
import tokenFunctions from 'glsl-token-functions';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

function getUniform(value) {
  if (typeof value === 'string') {
    return new Color$1(value);
  }

  return value;
}
function getSpecialParameters(label) {
  switch (label) {
    case 'alpha':
      return {
        min: 0,
        max: 1
      };

    case 'scale':
      return {
        min: 0
      };

    case 'map':
      return {
        image: undefined
      };

    default:
      return {};
  }
}

function roundToTwo(num) {
  return +Math.round((num + Number.EPSILON) * 100) / 100;
}

function isSerializableType(prop) {
  return prop instanceof Vector3 || prop instanceof Vector2 || prop instanceof Vector4 || prop instanceof Matrix3 || prop instanceof Matrix4;
}
function serializeProp(prop) {
  if (isSerializableType(prop)) {
    return prop.toArray().map(e => roundToTwo(e));
  } else if (prop instanceof Color$1) {
    return '#' + prop.clone().getHexString();
  } else if (prop instanceof Texture$1) {
    return prop.image.src;
  }

  return typeof prop === 'number' ? roundToTwo(prop) : prop;
}

const BlendModes = {
  normal: 'normal',
  add: 'add',
  subtract: 'subtract',
  multiply: 'multiply',
  lighten: 'lighten',
  darken: 'darken',
  divide: 'divide',
  overlay: 'overlay',
  screen: 'screen',
  softlight: 'softlight',
  negation: 'negation',
  reflect: 'reflect'
};
const NoiseTypes = {
  perlin: 'perlin',
  simplex: 'simplex',
  cell: 'cell',
  curl: 'curl',
  white: 'white'
};
const MappingTypes = {
  local: 'local',
  world: 'world',
  uv: 'uv'
};
const ShadingTypes = {
  phong: THREE.MeshPhongMaterial,
  physical: THREE.MeshPhysicalMaterial,
  toon: THREE.MeshToonMaterial,
  basic: THREE.MeshBasicMaterial,
  lambert: THREE.MeshLambertMaterial,
  standard: THREE.MeshStandardMaterial
};

class Abstract {
  constructor(c, props) {
    this.name = 'LayerMaterial';
    this.mode = 'normal';
    this.visible = true;
    this.uuid = MathUtils.generateUUID().replace(/-/g, '_');
    this.uniforms = {};
    this.schema = [];
    this.raw = {
      fragment: '',
      vertex: '',
      constructor: c,
      uniforms: {},
      nonUniforms: {
        mode: 'normal',
        visible: true
      }
    };
    this.vertexShader = '';
    this.fragmentShader = '';
    this.vertexVariables = '';
    this.fragmentVariables = '';
    this.onShaderParse = props == null ? void 0 : props.onShaderParse;
    this.onUniformsParse = props == null ? void 0 : props.onUniformsParse; // if (props && typeof props === 'object') {
    //   Object.keys(props).map((key) => {
    //     if (props[key] !== undefined) {
    //       // @ts-ignore
    //       this[key] = props[key]
    //     }
    //   })
    // }
    // Remove Name field from Debugger until a way to
    // rename Leva folders is found
    // this.schema.push({
    //   value: this.name,
    //   label: 'name',
    // })

    this.schema.push({
      value: this.mode,
      label: 'mode',
      options: Object.values(BlendModes)
    });
    this.schema.push({
      value: this.visible,
      label: 'visible'
    });
    this.init();
  }

  init() {
    const defaults = Object.getOwnPropertyNames(this.raw.constructor);
    defaults.forEach(v => {
      var _Object$getOwnPropert;

      let value = (_Object$getOwnPropert = Object.getOwnPropertyDescriptor(this.raw.constructor, v)) == null ? void 0 : _Object$getOwnPropert.value;
      if (isSerializableType(value) || value instanceof Color$1) value = value.clone();

      if (v.startsWith('u_')) {
        this.raw.uniforms[v.split('u_')[1]] = value;
      } else {
        switch (v) {
          case 'fragmentShader':
            this.raw.fragment = value;
            break;

          case 'vertexShader':
            this.raw.vertex = value;
            break;

          default:
            if (typeof value !== 'function' && !['prototype', 'length'].includes(v)) {
              this.raw.nonUniforms[v] = value;
            }

            break;
        }
      }
    });
    this.buildUniforms();
    this.buildNonUniforms();
    this.buildShaders();
  }

  buildUniforms() {
    var _this$onUniformsParse;

    const properties = {};
    Object.keys(this.raw.uniforms).map(propName => {
      // @ts-ignore
      if (this[propName] === undefined) {
        this.uniforms[`u_${this.uuid}_${propName}`] = {
          value: getUniform(this.raw.uniforms[propName])
        };
        this.schema.push({
          value: this.raw.uniforms[propName],
          label: propName
        });
        properties[propName] = {
          set: v => {
            this.uniforms[`u_${this.uuid}_${propName}`].value = getUniform(v);
          },
          get: () => {
            return this.uniforms[`u_${this.uuid}_${propName}`].value;
          }
        };
      }
    });
    const userDefinedUniforms = ((_this$onUniformsParse = this.onUniformsParse) == null ? void 0 : _this$onUniformsParse.call(this, this)) || {};
    Object.defineProperties(this, { ...properties,
      ...userDefinedUniforms
    });
  }

  buildNonUniforms() {
    var _this$onNonUniformsPa;

    const properties = {};
    Object.keys(this.raw.nonUniforms).map(propName => {
      // @ts-ignore
      if (this[`_${propName}`] === undefined) {
        this.schema.push({
          value: this.raw.nonUniforms[propName],
          label: propName
        }); //@ts-ignore

        this[`_${propName}`] = this.raw.nonUniforms[propName];
        properties[propName] = {
          set: v => {
            var _this$__updateMateria;

            //@ts-ignore
            this[`_${propName}`] = v;
            this.buildShaders();
            (_this$__updateMateria = this.__updateMaterial) == null ? void 0 : _this$__updateMateria.call(this);
          },
          get: () => {
            // @ts-ignore
            return this[`_${propName}`];
          }
        };
      }
    });
    const userDefinedUniforms = ((_this$onNonUniformsPa = this.onNonUniformsParse) == null ? void 0 : _this$onNonUniformsPa.call(this, this)) || {};
    Object.defineProperties(this, { ...properties,
      ...userDefinedUniforms
    });
  }

  buildShaders() {
    var _this$onShaderParse;

    const tokens = {
      vert: tokenize(this.raw.vertex),
      frag: tokenize(this.raw.fragment)
    };
    const descoped = {
      vert: descope(tokens.vert, this.renameTokens.bind(this)),
      frag: descope(tokens.frag, this.renameTokens.bind(this))
    };
    const funcs = {
      vert: tokenFunctions(descoped.vert),
      frag: tokenFunctions(descoped.frag)
    };
    const mainIndex = {
      vert: funcs.vert.map(e => {
        return e.name;
      }).indexOf('main'),
      frag: funcs.frag.map(e => {
        return e.name;
      }).indexOf('main')
    };
    const variables = {
      vert: mainIndex.vert >= 0 ? stringify(descoped.vert.slice(0, funcs.vert[mainIndex.vert].outer[0])) : '',
      frag: mainIndex.frag >= 0 ? stringify(descoped.frag.slice(0, funcs.frag[mainIndex.frag].outer[0])) : ''
    };
    const funcBodies = {
      vert: mainIndex.vert >= 0 ? this.getShaderFromIndex(descoped.vert, funcs.vert[mainIndex.vert].body) : '',
      frag: mainIndex.frag >= 0 ? this.getShaderFromIndex(descoped.frag, funcs.frag[mainIndex.frag].body) : ''
    };
    this.vertexShader = this.processFinal(funcBodies.vert, true);
    this.fragmentShader = this.processFinal(funcBodies.frag);
    this.vertexVariables = variables.vert;
    this.fragmentVariables = variables.frag;
    (_this$onShaderParse = this.onShaderParse) == null ? void 0 : _this$onShaderParse.call(this, this); // this.schema = this.schema.filter((value, index) => {
    //   const _value = value.label
    //   return (
    //     index ===
    //     this.schema.findIndex((obj) => {
    //       return obj.label === _value
    //     })
    //   )
    // })
  }

  renameTokens(name) {
    if (name.startsWith('u_')) {
      const slice = name.slice(2);
      return `u_${this.uuid}_${slice}`;
    } else if (name.startsWith('v_')) {
      const slice = name.slice(2);
      return `v_${this.uuid}_${slice}`;
    } else if (name.startsWith('f_')) {
      const slice = name.slice(2);
      return `f_${this.uuid}_${slice}`;
    } else {
      return name;
    }
  }

  processFinal(shader, isVertex) {
    const s = shader.replace(/\sf_/gm, ` f_${this.uuid}_`).replace(/\(f_/gm, `(f_${this.uuid}_`);
    const returnValue = s.match(/^.*return.*$/gm);
    let sReplaced = s.replace(/^.*return.*$/gm, '');

    if (returnValue != null && returnValue[0]) {
      const returnVariable = returnValue[0].replace('return', '').trim().replace(';', '');
      const blendMode = this.getBlendMode(returnVariable, 'lamina_finalColor');
      sReplaced += isVertex ? `lamina_finalPosition = ${returnVariable};` : `lamina_finalColor = ${blendMode};`;
    }

    return sReplaced;
  }

  getShaderFromIndex(tokens, index) {
    return stringify(tokens.slice(index[0], index[1]));
  }

  getBlendMode(b, a) {
    switch (this.mode) {
      default:
      case 'normal':
        return `lamina_blend_alpha(${a}, ${b}, ${b}.a)`;

      case 'add':
        return `lamina_blend_add(${a}, ${b}, ${b}.a)`;

      case 'subtract':
        return `lamina_blend_subtract(${a}, ${b}, ${b}.a)`;

      case 'multiply':
        return `lamina_blend_multiply(${a}, ${b}, ${b}.a)`;

      case 'lighten':
        return `lamina_blend_lighten(${a}, ${b}, ${b}.a)`;

      case 'darken':
        return `lamina_blend_darken(${a}, ${b}, ${b}.a)`;

      case 'divide':
        return `lamina_blend_divide(${a}, ${b}, ${b}.a)`;

      case 'overlay':
        return `lamina_blend_overlay(${a}, ${b}, ${b}.a)`;

      case 'screen':
        return `lamina_blend_screen(${a}, ${b}, ${b}.a)`;

      case 'softlight':
        return `lamina_blend_softlight(${a}, ${b}, ${b}.a)`;

      case 'reflect':
        return `lamina_blend_reflect(${a}, ${b}, ${b}.a)`;

      case 'negation':
        return `lamina_blend_negation(${a}, ${b}, ${b}.a)`;
    }
  }

  getHash() {
    const nonUniformKeys = Object.keys(this.raw.nonUniforms);
    const uniformKeys = Object.keys(this.raw.uniforms);
    const unifiedKeys = [...nonUniformKeys, ...uniformKeys]; // @ts-ignore

    const values = unifiedKeys.map(key => serializeProp(this[key]));
    return hash(values);
  }

  getSchema() {
    const latestSchema = this.schema.map(({
      label,
      options,
      ...rest
    }) => {
      return {
        label,
        options,
        ...getSpecialParameters(label),
        ...rest,
        // @ts-ignore
        value: serializeProp(this[label])
      };
    });
    return latestSchema;
  }

  serialize() {
    var _this$onShaderParse2, _this$onNonUniformsPa2, _this$onUniformsParse2;

    const name = this.constructor.name.split('$')[0];
    const uniforms = {};
    Object.entries(this.raw.uniforms).forEach(([key, value]) => {
      uniforms[key] = serializeProp(value);
    });
    const nonUniforms = {};
    Object.entries(this.raw.nonUniforms).forEach(([key, value]) => {
      nonUniforms[key] = serializeProp(value);
    });
    const currents = {};
    const allValueKeys = [...Object.keys(uniforms), ...Object.keys(nonUniforms)];
    allValueKeys // @ts-ignore
    .map(key => this[key]).forEach((value, i) => {
      const key = allValueKeys[i];
      currents[key] = serializeProp(value);
    });
    return {
      constructor: name,
      fragment: this.raw.fragment,
      vertex: this.raw.vertex,
      uniforms: uniforms,
      nonUniforms: nonUniforms,
      currents: currents,
      functions: {
        onShaderParse: (_this$onShaderParse2 = this.onShaderParse) == null ? void 0 : _this$onShaderParse2.toString(),
        onNonUniformsParse: (_this$onNonUniformsPa2 = this.onNonUniformsParse) == null ? void 0 : _this$onNonUniformsPa2.toString(),
        onUniformsParse: (_this$onUniformsParse2 = this.onUniformsParse) == null ? void 0 : _this$onUniformsParse2.toString()
      }
    };
  }

}

class Depth extends Abstract {
  constructor(props) {
    super(Depth, {
      name: 'Depth',
      ...props,
      onShaderParse: self => {
        function getMapping(uuid, type) {
          switch (type) {
            default:
            case 'vector':
              return `length(v_${uuid}_worldPosition - u_${uuid}_origin)`;

            case 'world':
              return `length(v_${uuid}_position - vec3(0.))`;

            case 'camera':
              return `length(v_${uuid}_worldPosition - cameraPosition)`;
          }
        }

        self.schema.push({
          value: self.mapping,
          label: 'mapping',
          options: ['vector', 'world', 'camera']
        });
        const mapping = getMapping(self.uuid, self.mapping);
        self.fragmentShader = self.fragmentShader.replace('lamina_mapping_template', mapping);
      }
    });
  }

}
Depth.u_near = 2;
Depth.u_far = 10;
Depth.u_origin = new Vector3(0, 0, 0);
Depth.u_colorA = 'white';
Depth.u_colorB = 'black';
Depth.u_alpha = 1;
Depth.vertexShader = `
  varying vec3 v_worldPosition;
  varying vec3 v_position;

  void main() {
    v_worldPosition = (vec4(position, 1.0) * modelMatrix).xyz;
    v_position = position;
  }
  `;
Depth.fragmentShader = `   
    uniform float u_alpha;
    uniform float u_near;
    uniform float u_far;
    uniform float u_isVector;
    uniform vec3 u_origin;
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;

    varying vec3 v_worldPosition;
    varying vec3 v_position;

    void main() {
      float f_dist = lamina_mapping_template;
      float f_depth = (f_dist - u_near) / (u_far - u_near);
			vec3 f_depthColor =  mix(u_colorB, u_colorA, 1.0 - clamp(f_depth, 0., 1.));
  
  
      return vec4(f_depthColor, u_alpha);
    }
  `;
Depth.mapping = 'vector';

class Color extends Abstract {
  constructor(props) {
    super(Color, {
      name: 'Color',
      ...props
    });
  }

}
Color.u_color = 'red';
Color.u_alpha = 1;
Color.fragmentShader = `   
    uniform vec3 u_color;
    uniform float u_alpha;

    void main() {
      return vec4(u_color, u_alpha);
    }
  `;

class Noise extends Abstract {
  constructor(props) {
    super(Noise, {
      name: 'noise',
      ...props,
      onShaderParse: self => {
        function getNoiseFunction(type) {
          switch (type) {
            default:
            case 'perlin':
              return `lamina_noise_perlin`;

            case 'simplex':
              return `lamina_noise_simplex`;

            case 'cell':
              return `lamina_noise_worley`;

            case 'white':
              return `lamina_noise_white`;

            case 'curl':
              return `lamina_noise_swirl`;
          }
        }

        function getMapping(type) {
          switch (type) {
            default:
            case 'local':
              return `position`;

            case 'world':
              return `(modelMatrix * vec4(position,1.0)).xyz`;

            case 'uv':
              return `vec3(uv, 0.)`;
          }
        }

        self.schema.push({
          value: self.type,
          label: 'type',
          options: ['perlin', 'simplex', 'cell', 'curl', 'white']
        });
        self.schema.push({
          value: self.mapping,
          label: 'mapping',
          options: ['local', 'world', 'uv']
        });
        const noiseFunc = getNoiseFunction(self.type);
        const mapping = getMapping(self.mapping);
        self.vertexShader = self.vertexShader.replace('lamina_mapping_template', mapping);
        self.fragmentShader = self.fragmentShader.replace('lamina_noise_template', noiseFunc);
      }
    });
  }

}
Noise.u_colorA = '#666666';
Noise.u_colorB = '#666666';
Noise.u_colorC = '#FFFFFF';
Noise.u_colorD = '#FFFFFF';
Noise.u_alpha = 1;
Noise.u_scale = 1;
Noise.u_offset = new Vector3(0, 0, 0);
Noise.vertexShader = `
    varying vec3 v_position;

    void main() {
        v_position = lamina_mapping_template;
    }
  `;
Noise.fragmentShader = `   
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform vec3 u_colorC;
    uniform vec3 u_colorD;
    uniform vec3 u_offset;

    uniform float u_alpha;
    uniform float u_scale;

    varying vec3 v_position;


    void main() {
        float f_n = lamina_noise_template((v_position + u_offset) * u_scale);

        float f_step1 = 0.;
        float f_step2 = 0.2;
        float f_step3 = 0.6;
        float f_step4 = 1.;

        vec3 f_color = mix(u_colorA, u_colorB, smoothstep(f_step1, f_step2, f_n));
        f_color = mix(f_color, u_colorC, smoothstep(f_step2, f_step3, f_n));
        f_color = mix(f_color, u_colorD, smoothstep(f_step3, f_step4, f_n));

        return vec4(f_color, u_alpha);
    }
  `;
Noise.type = 'perlin';
Noise.mapping = 'local';

class Fresnel extends Abstract {
  constructor(props) {
    super(Fresnel, {
      name: 'Fresnel',
      ...props
    });
  }

}
Fresnel.u_color = 'white';
Fresnel.u_alpha = 1;
Fresnel.u_bias = 0;
Fresnel.u_intensity = 1;
Fresnel.u_power = 2;
Fresnel.u_factor = 1;
Fresnel.vertexShader = `
    varying vec3 v_worldPosition;
    varying vec3 v_worldNormal;

    void main() {
        v_worldPosition = vec3(-viewMatrix[0][2], -viewMatrix[1][2], -viewMatrix[2][2]);
        v_worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
        
    }
  `;
Fresnel.fragmentShader = `   
    uniform vec3 u_color;
    uniform float u_alpha;
    uniform float u_bias;
    uniform float u_intensity;
    uniform float u_power;
    uniform float u_factor;

    varying vec3 v_worldPosition;
    varying vec3 v_worldNormal;

    void main() {
        float f_a = (u_factor  + dot(v_worldPosition, v_worldNormal));
        float f_fresnel = u_bias + u_intensity * pow(abs(f_a), u_power);

        f_fresnel = clamp(f_fresnel, 0.0, 1.0);
        return vec4(f_fresnel * u_color, u_alpha);
    }
  `;

class Gradient extends Abstract {
  constructor(props) {
    super(Gradient, {
      name: 'Gradient',
      ...props,
      onShaderParse: self => {
        self.schema.push({
          value: self.axes,
          label: 'axes',
          options: ['x', 'y', 'z']
        });
        self.schema.push({
          value: self.mapping,
          label: 'mapping',
          options: Object.values(MappingTypes)
        });
        const mapping = Gradient.getMapping(self.mapping);
        self.vertexShader = self.vertexShader.replace('lamina_mapping_template', mapping);
        self.fragmentShader = self.fragmentShader.replace('axes_template', self.axes);
      }
    });
  }

  static getMapping(type) {
    switch (type) {
      default:
      case 'local':
        return `position`;

      case 'world':
        return `(modelMatrix * vec4(position,1.0)).xyz`;

      case 'uv':
        return `vec3(uv, 0.)`;
    }
  }

}
Gradient.u_colorA = 'white';
Gradient.u_colorB = 'black';
Gradient.u_alpha = 1;
Gradient.u_start = 1;
Gradient.u_end = -1;
Gradient.u_contrast = 1;
Gradient.vertexShader = `
		varying vec3 v_position;

		vod main() {
      v_position = lamina_mapping_template;
		}
  `;
Gradient.fragmentShader = `   
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform vec3 u_axis;
    uniform float u_alpha;
    uniform float u_start;
    uniform float u_end;
    uniform float u_contrast;

		varying vec3 v_position;

    void main() {

      float f_step = smoothstep(u_start, u_end, v_position.axes_template * u_contrast);
      vec3 f_color = mix(u_colorA, u_colorB, f_step);

      return vec4(f_color, u_alpha);
    }
  `;
Gradient.axes = 'x';
Gradient.mapping = 'local';

class Matcap extends Abstract {
  constructor(props) {
    super(Matcap, {
      name: 'Matcap',
      ...props
    });
  }

}
Matcap.u_alpha = 1;
Matcap.u_map = undefined;
Matcap.vertexShader = `
    varying vec3 v_position;
    varying vec3 v_normal;
    
    void main() {
      v_position = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );
      v_normal = normalize( normalMatrix * normal );
    }
    `;
Matcap.fragmentShader = ` 
		uniform sampler2D u_map;  
		uniform float u_alpha;  
		varying vec3 v_position;
		varying vec3 v_normal;

		
    void main() {
			vec3 f_r = reflect( v_position, v_normal );
			float f_m = 2. * sqrt( pow( f_r.x, 2. ) + pow( f_r.y, 2. ) + pow( f_r.z + 1., 2. ) );
			vec2 f_vN = f_r.xy / f_m + .5;

			vec3 f_base = texture2D(u_map, f_vN).rgb;

      return vec4(f_base, u_alpha);
    }
  `;

class Texture extends Abstract {
  constructor(props) {
    super(Texture, {
      name: 'Texture',
      ...props
    });
  }

}
Texture.u_alpha = 1;
Texture.u_map = null;
Texture.vertexShader = `
    varying vec2 v_uv;
    
    void main() {
        v_uv = uv;
    }
    `;
Texture.fragmentShader = ` 
		uniform sampler2D u_map;  
		uniform float u_alpha;  
		varying vec2 v_uv;

    void main() {
			vec3 f_color = texture2D(u_map, v_uv).rgb;
      return vec4(f_color, u_alpha);
    }
  `;

class Displace extends Abstract {
  constructor(props) {
    super(Displace, {
      name: 'Displace',
      ...props,
      onShaderParse: self => {
        self.schema.push({
          value: self.type,
          label: 'type',
          options: Object.values(NoiseTypes)
        });
        self.schema.push({
          value: self.mapping,
          label: 'mapping',
          options: Object.values(MappingTypes)
        });
        const noiseFunc = Displace.getNoiseFunction(self.type);
        const mapping = Displace.getMapping(self.mapping);
        self.vertexVariables = self.vertexVariables.replace('lamina_mapping_template', mapping);
        self.vertexVariables = self.vertexVariables.replace('lamina_noise_template', noiseFunc);
      }
    });
  }

  static getNoiseFunction(type) {
    switch (type) {
      default:
      case 'perlin':
        return `lamina_noise_perlin`;

      case 'simplex':
        return `lamina_noise_simplex`;

      case 'cell':
        return `lamina_noise_worley`;

      case 'white':
        return `lamina_noise_white`;

      case 'curl':
        return `lamina_noise_swirl`;
    }
  }

  static getMapping(type) {
    switch (type) {
      default:
      case 'local':
        return `p`;

      case 'world':
        return `(modelMatrix * vec4(p,1.0)).xyz`;

      case 'uv':
        return `vec3(uv, 0.)`;
    }
  }

}
Displace.u_strength = 1;
Displace.u_scale = 1;
Displace.u_offset = new Vector3(0, 0, 0);
Displace.vertexShader = `
       
      uniform float u_strength;
      uniform float u_scale;
      uniform vec3 u_offset;

      vec3 displace(vec3 p) {
				vec3 f_position = lamina_mapping_template;
        float f_n = lamina_noise_template((f_position + u_offset) * u_scale) * u_strength;
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
    `;
Displace.type = 'perlin';
Displace.mapping = 'local';

class Normal extends Abstract {
  constructor(props) {
    super(Normal, {
      name: 'Normal',
      ...props
    });
  }

}
Normal.u_alpha = 1;
Normal.u_direction = new Vector3(1, 1, 1);
Normal.vertexShader = `   
  varying vec3 v_normals; 

  void main() {
    v_normals = normal;
  }
`;
Normal.fragmentShader = `   
  	uniform float u_alpha;
  	uniform vec3 u_color;
  	uniform vec3 u_direction;

		varying vec3 v_normals;

    void main() {
			vec3 f_normalColor = vec3(1.);
      f_normalColor.x = v_normals.x * u_direction.x;
      f_normalColor.y = v_normals.y * u_direction.y;
      f_normalColor.z = v_normals.z * u_direction.z;

      return vec4(f_normalColor, u_alpha);
    }
  `;

class Shader extends Abstract {
  constructor(props) {
    super(Shader, {
      name: 'Shader',
      extern: true,
      ...props
    });
    this._fragment = '';
    this._vertex = '';
    return new Proxy(this, this);
  }

  set fragment(v) {
    var _this$__updateMateria;

    this._fragment = v;
    this.raw.fragment = v;
    this.raw.vertex = this._vertex;
    this.buildShaders();
    (_this$__updateMateria = this.__updateMaterial) == null ? void 0 : _this$__updateMateria.call(this);
  }

  get fragment() {
    return this._fragment;
  }

  set vertex(v) {
    var _this$__updateMateria2;

    this._vertex = v;
    this.raw.vertex = v;
    this.raw.fragment = this._fragment;
    this.buildShaders();
    (_this$__updateMateria2 = this.__updateMaterial) == null ? void 0 : _this$__updateMateria2.call(this);
  }

  get vertex() {
    return this._vertex;
  }

  get(target, name) {
    return target[name];
  }

  set(target, name, val) {
    if (name.startsWith('u_')) {
      const key = name.split('u_')[1];

      if (target.raw.uniforms[key] === undefined) {
        target.raw.uniforms[key] = val;
        target.buildUniforms();
      }

      target[key] = val;
      return true;
    }

    target[name] = val;
    return true;
  }

}

var BlendModesChunk = /* glsl */
`
vec4 lamina_blend_add(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(min(x.xyz + y.xyz, 1.0) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec3 lamina_blend_alpha(const in vec3 x, const in vec3 y, const in float opacity) {

	return y * opacity + x * (1.0 - opacity);

}

vec4 lamina_blend_alpha(const in vec4 x, const in vec4 y, const in float opacity) {

	float a = min(y.a, opacity);

	return vec4(lamina_blend_alpha(x.rgb, y.rgb, a), x.a);

}
vec4 lamina_blend_average(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((x.xyz + y.xyz) * 0.5 * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_color_burn(const in float x, const in float y) {

	return (y == 0.0) ? y : max(1.0 - (1.0 - x) / y, 0.0);

}

vec4 lamina_blend_color_burn(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_color_burn(x.r, y.r),
		lamina_blend_color_burn(x.g, y.g),
		lamina_blend_color_burn(x.b, y.b),
		lamina_blend_color_burn(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_color_dodge(const in float x, const in float y) {

	return (y == 1.0) ? y : min(x / (1.0 - y), 1.0);

}

vec4 lamina_blend_color_dodge(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_color_dodge(x.r, y.r),
		lamina_blend_color_dodge(x.g, y.g),
		lamina_blend_color_dodge(x.b, y.b),
		lamina_blend_color_dodge(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_darken(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(min(x.xyz, y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_difference(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(abs(x.xyz - y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_divide(const in float x, const in float y) {

	return (y > 0.0) ? min(x / y, 1.0) : 1.0;

}

vec4 lamina_blend_divide(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_divide(x.r, y.r),
		lamina_blend_divide(x.g, y.g),
		lamina_blend_divide(x.b, y.b),
		lamina_blend_divide(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_exclusion(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((x.xyz + y.xyz - 2.0 * x.xyz * y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_lighten(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(max(x.xyz, y.xyz) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_multiply(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4( x.xyz * y.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_negation(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((1.0 - abs(1.0 - x.xyz - y.xyz)) * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_normal(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(y.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_overlay(const in float x, const in float y) {

	return (x < 0.5) ? (2.0 * x * y) : (1.0 - 2.0 * (1.0 - x) * (1.0 - y));

}

vec4 lamina_blend_overlay(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_overlay(x.r, y.r),
		lamina_blend_overlay(x.g, y.g),
		lamina_blend_overlay(x.b, y.b),
		lamina_blend_overlay(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_reflect(const in float x, const in float y) {

	return (y == 1.0) ? y : min(x * x / (1.0 - y), 1.0);

}

vec4 lamina_blend_reflect(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_reflect(x.r, y.r),
		lamina_blend_reflect(x.g, y.g),
		lamina_blend_reflect(x.b, y.b),
		lamina_blend_reflect(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_screen(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4((1.0 - (1.0 - x.xyz) * (1.0 - y.xyz)) * opacity + x.xyz * (1.0 - opacity), x.a);

}
float lamina_blend_softlight(const in float x, const in float y) {

	return (y < 0.5) ?
		(2.0 * x * y + x * x * (1.0 - 2.0 * y)) :
		(sqrt(x) * (2.0 * y - 1.0) + 2.0 * x * (1.0 - y));

}

vec4 lamina_blend_softlight(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		lamina_blend_softlight(x.r, y.r),
		lamina_blend_softlight(x.g, y.g),
		lamina_blend_softlight(x.b, y.b),
		lamina_blend_softlight(x.a, y.a)
	);

	return vec4(z.xyz * opacity + x.xyz * (1.0 - opacity), x.a);

}
vec4 lamina_blend_subtract(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(max(x.xyz + y.xyz - 1.0, 0.0) * opacity + x.xyz * (1.0 - opacity), x.a);

}

`;

var NoiseChunk = /* glsl */
`

// From: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
// Huge thanks to the creators of these algorithms

float lamina_noise_mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 lamina_noise_mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 lamina_noise_perm(vec4 x){return lamina_noise_mod289(((x * 34.0) + 1.0) * x);}
vec4 lamina_noise_permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 lamina_noise_taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }


float lamina_noise_white(vec2 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) *
               (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

float lamina_noise_white(vec3 p) {
  return lamina_noise_white(p.xy);
}


vec3 lamina_noise_fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float lamina_noise_perlin(vec3 P) {
  vec3 Pi0 = floor(P);        // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);        // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = lamina_noise_permute(lamina_noise_permute(ix) + iy);
  vec4 ixy0 = lamina_noise_permute(ixy + iz0);
  vec4 ixy1 = lamina_noise_permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = lamina_noise_taylorInvSqrt(
      vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = lamina_noise_taylorInvSqrt(
      vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = lamina_noise_fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111),
                 fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return lamina_normalize(2.2 * n_xyz);
}

float lamina_noise_simplex(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0);
  vec4 p = lamina_noise_permute(lamina_noise_permute(lamina_noise_permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y +
                             vec4(0.0, i1.y, i2.y, 1.0)) +
                    i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0 / 7.0; // N=7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_); // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm =
      lamina_noise_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m =
      max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return lamina_normalize(42.0 *
         dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))));
}

vec3 lamina_noise_simplex3(vec3 x) {
  float s = lamina_noise_simplex(vec3(x));
  float s1 = lamina_noise_simplex(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = lamina_noise_simplex(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  vec3 c = vec3(s, s1, s2);
  return c;
}

vec3 lamina_noise_curl(vec3 p) {
  const float e = .1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 p_x0 = lamina_noise_simplex3(p - dx);
  vec3 p_x1 = lamina_noise_simplex3(p + dx);
  vec3 p_y0 = lamina_noise_simplex3(p - dy);
  vec3 p_y1 = lamina_noise_simplex3(p + dy);
  vec3 p_z0 = lamina_noise_simplex3(p - dz);
  vec3 p_z1 = lamina_noise_simplex3(p + dz);

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

vec3 lamina_permute(vec3 x) {
  return mod((34.0 * x + 1.0) * x, 289.0);
}

vec3 lamina_dist(vec3 x, vec3 y, vec3 z,  bool manhattanDistance) {
  return manhattanDistance ?  abs(x) + abs(y) + abs(z) :  (x * x + y * y + z * z);
}

// From: https://github.com/Erkaman/glsl-worley
float lamina_noise_worley(vec3 P) {
  float jitter = 1.;
  bool manhattanDistance = false; 

  float K = 0.142857142857; // 1/7
  float Ko = 0.428571428571; // 1/2-K/2
  float  K2 = 0.020408163265306; // 1/(7*7)
  float Kz = 0.166666666667; // 1/6
  float Kzo = 0.416666666667; // 1/2-1/6*2

	vec3 Pi = mod(floor(P), 289.0);
 	vec3 Pf = fract(P) - 0.5;

	vec3 Pfx = Pf.x + vec3(1.0, 0.0, -1.0);
	vec3 Pfy = Pf.y + vec3(1.0, 0.0, -1.0);
	vec3 Pfz = Pf.z + vec3(1.0, 0.0, -1.0);

	vec3 p = lamina_permute(Pi.x + vec3(-1.0, 0.0, 1.0));
	vec3 p1 = lamina_permute(p + Pi.y - 1.0);
	vec3 p2 = lamina_permute(p + Pi.y);
	vec3 p3 = lamina_permute(p + Pi.y + 1.0);

	vec3 p11 = lamina_permute(p1 + Pi.z - 1.0);
	vec3 p12 = lamina_permute(p1 + Pi.z);
	vec3 p13 = lamina_permute(p1 + Pi.z + 1.0);

	vec3 p21 = lamina_permute(p2 + Pi.z - 1.0);
	vec3 p22 = lamina_permute(p2 + Pi.z);
	vec3 p23 = lamina_permute(p2 + Pi.z + 1.0);

	vec3 p31 = lamina_permute(p3 + Pi.z - 1.0);
	vec3 p32 = lamina_permute(p3 + Pi.z);
	vec3 p33 = lamina_permute(p3 + Pi.z + 1.0);

	vec3 ox11 = fract(p11*K) - Ko;
	vec3 oy11 = mod(floor(p11*K), 7.0)*K - Ko;
	vec3 oz11 = floor(p11*K2)*Kz - Kzo; // p11 < 289 guaranteed

	vec3 ox12 = fract(p12*K) - Ko;
	vec3 oy12 = mod(floor(p12*K), 7.0)*K - Ko;
	vec3 oz12 = floor(p12*K2)*Kz - Kzo;

	vec3 ox13 = fract(p13*K) - Ko;
	vec3 oy13 = mod(floor(p13*K), 7.0)*K - Ko;
	vec3 oz13 = floor(p13*K2)*Kz - Kzo;

	vec3 ox21 = fract(p21*K) - Ko;
	vec3 oy21 = mod(floor(p21*K), 7.0)*K - Ko;
	vec3 oz21 = floor(p21*K2)*Kz - Kzo;

	vec3 ox22 = fract(p22*K) - Ko;
	vec3 oy22 = mod(floor(p22*K), 7.0)*K - Ko;
	vec3 oz22 = floor(p22*K2)*Kz - Kzo;

	vec3 ox23 = fract(p23*K) - Ko;
	vec3 oy23 = mod(floor(p23*K), 7.0)*K - Ko;
	vec3 oz23 = floor(p23*K2)*Kz - Kzo;

	vec3 ox31 = fract(p31*K) - Ko;
	vec3 oy31 = mod(floor(p31*K), 7.0)*K - Ko;
	vec3 oz31 = floor(p31*K2)*Kz - Kzo;

	vec3 ox32 = fract(p32*K) - Ko;
	vec3 oy32 = mod(floor(p32*K), 7.0)*K - Ko;
	vec3 oz32 = floor(p32*K2)*Kz - Kzo;

	vec3 ox33 = fract(p33*K) - Ko;
	vec3 oy33 = mod(floor(p33*K), 7.0)*K - Ko;
	vec3 oz33 = floor(p33*K2)*Kz - Kzo;

	vec3 dx11 = Pfx + jitter*ox11;
	vec3 dy11 = Pfy.x + jitter*oy11;
	vec3 dz11 = Pfz.x + jitter*oz11;

	vec3 dx12 = Pfx + jitter*ox12;
	vec3 dy12 = Pfy.x + jitter*oy12;
	vec3 dz12 = Pfz.y + jitter*oz12;

	vec3 dx13 = Pfx + jitter*ox13;
	vec3 dy13 = Pfy.x + jitter*oy13;
	vec3 dz13 = Pfz.z + jitter*oz13;

	vec3 dx21 = Pfx + jitter*ox21;
	vec3 dy21 = Pfy.y + jitter*oy21;
	vec3 dz21 = Pfz.x + jitter*oz21;

	vec3 dx22 = Pfx + jitter*ox22;
	vec3 dy22 = Pfy.y + jitter*oy22;
	vec3 dz22 = Pfz.y + jitter*oz22;

	vec3 dx23 = Pfx + jitter*ox23;
	vec3 dy23 = Pfy.y + jitter*oy23;
	vec3 dz23 = Pfz.z + jitter*oz23;

	vec3 dx31 = Pfx + jitter*ox31;
	vec3 dy31 = Pfy.z + jitter*oy31;
	vec3 dz31 = Pfz.x + jitter*oz31;

	vec3 dx32 = Pfx + jitter*ox32;
	vec3 dy32 = Pfy.z + jitter*oy32;
	vec3 dz32 = Pfz.y + jitter*oz32;

	vec3 dx33 = Pfx + jitter*ox33;
	vec3 dy33 = Pfy.z + jitter*oy33;
	vec3 dz33 = Pfz.z + jitter*oz33;

	vec3 d11 = lamina_dist(dx11, dy11, dz11, manhattanDistance);
	vec3 d12 = lamina_dist(dx12, dy12, dz12, manhattanDistance);
	vec3 d13 = lamina_dist(dx13, dy13, dz13, manhattanDistance);
	vec3 d21 = lamina_dist(dx21, dy21, dz21, manhattanDistance);
	vec3 d22 = lamina_dist(dx22, dy22, dz22, manhattanDistance);
	vec3 d23 = lamina_dist(dx23, dy23, dz23, manhattanDistance);
	vec3 d31 = lamina_dist(dx31, dy31, dz31, manhattanDistance);
	vec3 d32 = lamina_dist(dx32, dy32, dz32, manhattanDistance);
	vec3 d33 = lamina_dist(dx33, dy33, dz33, manhattanDistance);

	vec3 d1a = min(d11, d12);
	d12 = max(d11, d12);
	d11 = min(d1a, d13); // Smallest now not in d12 or d13
	d13 = max(d1a, d13);
	d12 = min(d12, d13); // 2nd smallest now not in d13
	vec3 d2a = min(d21, d22);
	d22 = max(d21, d22);
	d21 = min(d2a, d23); // Smallest now not in d22 or d23
	d23 = max(d2a, d23);
	d22 = min(d22, d23); // 2nd smallest now not in d23
	vec3 d3a = min(d31, d32);
	d32 = max(d31, d32);
	d31 = min(d3a, d33); // Smallest now not in d32 or d33
	d33 = max(d3a, d33);
	d32 = min(d32, d33); // 2nd smallest now not in d33
	vec3 da = min(d11, d21);
	d21 = max(d11, d21);
	d11 = min(da, d31); // Smallest now in d11
	d31 = max(da, d31); // 2nd smallest now not in d31
	d11.xy = (d11.x < d11.y) ? d11.xy : d11.yx;
	d11.xz = (d11.x < d11.z) ? d11.xz : d11.zx; // d11.x now smallest
	d12 = min(d12, d21); // 2nd smallest now not in d21
	d12 = min(d12, d22); // nor in d22
	d12 = min(d12, d31); // nor in d31
	d12 = min(d12, d32); // nor in d32
	d11.yz = min(d11.yz,d12.xy); // nor in d12.yz
	d11.y = min(d11.y,d12.z); // Only two more to go
	d11.y = min(d11.y,d11.z); // Done! (Phew!)

  vec2 F = sqrt(d11.xy);
	return F.x; // F1, F2

}

float lamina_noise_swirl(vec3 position) {
    float scale = 0.1;
    float freq = 4. * scale;
    float t = 1.;

    vec3 pos = (position * scale) + lamina_noise_curl(position * 7. * scale);

    float worley1 = 1. - lamina_noise_worley((pos * (freq * 2.)) +  (t * 2.));
    float worley2 = 1. - lamina_noise_worley((pos * (freq * 4.)) +  (t * 4.));
    float worley3 = 1. - lamina_noise_worley((pos * (freq * 8.)) +  (t * 8.));
    float worley4 = 1. - lamina_noise_worley((pos * (freq * 16.)) +  (t * 16.));
    
    float fbm1 = worley1 * .625 + worley2 * .25 + worley3 * .125;
    float fbm2 = worley2 * .625 + worley3 * .25 + worley4 * .125;
    float fbm3 = worley3 * .75 + worley4 * .25;

    vec3 curlWorleyFbm = vec3(fbm1, fbm2, fbm3);
    float curlWorley = curlWorleyFbm.r * .625 + curlWorleyFbm.g * .25 + 
        curlWorleyFbm.b * .125;

    return curlWorley;
}
  
  
`;

var HelpersChunk = /* glsl */
`

float lamina_map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float lamina_normalize(float v) { return lamina_map(v, -1.0, 1.0, 0.0, 1.0); }
`;

class LayerMaterial extends CustomShaderMaterial {
  constructor({
    color,
    alpha,
    lighting,
    layers,
    ...props
  } = {}) {
    super({
      baseMaterial: ShadingTypes[lighting || 'basic'],
      ...props
    });
    this.layers = [];
    this.lighting = 'basic';

    const _baseColor = color || 'white';

    const _alpha = alpha != null ? alpha : 1;

    this.uniforms = {
      u_lamina_color: {
        value: typeof _baseColor === 'string' ? new THREE.Color(_baseColor).convertSRGBToLinear() : _baseColor
      },
      u_lamina_alpha: {
        value: _alpha
      }
    };
    this.layers = layers || this.layers;
    this.lighting = lighting || this.lighting;
    this.refresh();
  }

  genShaders() {
    let vertexVariables = '';
    let fragmentVariables = '';
    let vertexShader = '';
    let fragmentShader = '';
    let uniforms = {};
    this.layers.filter(l => l.visible).forEach(l => {
      // l.buildShaders(l.constructor)
      vertexVariables += l.vertexVariables + '\n';
      fragmentVariables += l.fragmentVariables + '\n';
      vertexShader += l.vertexShader + '\n';
      fragmentShader += l.fragmentShader + '\n';
      uniforms = { ...uniforms,
        ...l.uniforms
      };
    });
    uniforms = { ...uniforms,
      ...this.uniforms
    };
    return {
      uniforms,
      vertexShader: `
        ${HelpersChunk}
        ${NoiseChunk}
        ${vertexVariables}

        void main() {
          vec3 lamina_finalPosition = position;
          vec3 lamina_finalNormal = normal;

          ${vertexShader}

          csm_Position = lamina_finalPosition;
          csm_Normal = lamina_finalNormal;
        }
        `,
      fragmentShader: `
        ${HelpersChunk}
        ${NoiseChunk}
        ${BlendModesChunk}
        ${fragmentVariables}

        uniform vec3 u_lamina_color;
        uniform float u_lamina_alpha;

        void main() {
          vec4 lamina_finalColor = vec4(u_lamina_color, u_lamina_alpha);

          ${fragmentShader}

          csm_DiffuseColor = lamina_finalColor;
         
        }
        `
    };
  }

  refresh() {
    this.layers.map(layer => {
      if (!layer.__updateMaterial) {
        layer.__updateMaterial = this.refresh.bind(this);
      }

      return layer.getHash();
    });
    const {
      uniforms,
      fragmentShader,
      vertexShader
    } = this.genShaders();
    super.update({
      fragmentShader,
      vertexShader,
      uniforms
    });
  }

  serialize() {
    return {
      constructor: 'LayerMaterial',
      currents: this.toJSON()
    };
  }

  set color(v) {
    var _this$uniforms, _this$uniforms$u_lami;

    if ((_this$uniforms = this.uniforms) != null && (_this$uniforms$u_lami = _this$uniforms.u_lamina_color) != null && _this$uniforms$u_lami.value) this.uniforms.u_lamina_color.value = typeof v === 'string' ? new THREE.Color(v).convertSRGBToLinear() : v;
  }

  get color() {
    var _this$uniforms2, _this$uniforms2$u_lam;

    return (_this$uniforms2 = this.uniforms) == null ? void 0 : (_this$uniforms2$u_lam = _this$uniforms2.u_lamina_color) == null ? void 0 : _this$uniforms2$u_lam.value;
  }

  set alpha(v) {
    this.uniforms.u_lamina_alpha.value = v;
  }

  get alpha() {
    return this.uniforms.u_lamina_alpha.value;
  }

  toJSON(meta) {
    return { ...super.toJSON(),
      lighting: this.lighting,
      name: this.name
    };
  }

}

class ImportedLayer extends Abstract {
  constructor(props) {
    super(ImportedLayer, props);
  }

}

function isBase64UrlImage(s) {
  return s.trim().startsWith('data:image');
}

class LaminaLoader extends THREE.Loader {
  constructor(manager) {
    super(manager);
    this.texLoader = new THREE.TextureLoader();
  }

  load(url, onLoad, onError) {
    fetch(url).then(resp => resp.json().then(async json => {
      if (json.metadata.type === 'mat') {
        const data = json;
        const layers = await Promise.all(data.layers.map(async layer => {
          const l = new Abstract(ImportedLayer);
          l.raw.fragment = layer.fragment;
          l.raw.vertex = layer.vertex;
          l.raw.uniforms = layer.uniforms;
          l.raw.nonUniforms = layer.nonUniforms;
          l.onShaderParse = new Function(`return (${layer.functions.onShaderParse})`)();
          l.onNonUniformsParse = new Function(`return (${layer.functions.onNonUniformsParse})`)();
          l.onUniformsParse = new Function(`return (${layer.functions.onUniformsParse})`)();
          l.buildUniforms();
          l.buildNonUniforms();
          l.buildShaders();
          await Promise.all(Object.entries(layer.currents).map(async ([key, val]) => {
            if (typeof val === 'string' && isBase64UrlImage(val)) {
              const t = await this.texLoader.loadAsync(val);
              t.encoding = THREE.sRGBEncoding; //@ts-ignore

              l[key] = t;
            } else {
              //@ts-ignore
              l[key] = val;
            }
          }));
          return l;
        }));
        delete data.base.currents.metadata;
        const mat = new LayerMaterial({ ...data.base.currents,
          layers
        });
        onLoad == null ? void 0 : onLoad(mat);
      }
    }).catch(e => onError == null ? void 0 : onError(e))).catch(e => onError == null ? void 0 : onError(e));
  }

  loadAsync(url) {
    return new Promise((resolve, reject) => {
      this.load(url, e => {
        resolve(e);
      }, err => {
        reject(err);
      });
    });
  }

}

export { Abstract, Color, Depth, Displace, Fresnel, Gradient, LaminaLoader, LayerMaterial, Matcap, Noise, Normal, Shader, Texture };
