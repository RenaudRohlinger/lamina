declare const _default: "\n\nfloat lamina_map(float value, float min1, float max1, float min2, float max2) {\n  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);\n}\n\nfloat lamina_normalize(float v) { return lamina_map(v, -1.0, 1.0, 0.0, 1.0); }\n";
export default _default;
