import { LaminaLayerFile, LaminaMaterialFile, SerializedLayer } from '../types';
export declare function serializedLayersToJSX(layers: SerializedLayer[], material: Partial<SerializedLayer>): string;
export declare function serializedLayersToJS(layers: SerializedLayer[], material: SerializedLayer): string;
export declare function downloadObjectAsJson(exportObj: LaminaMaterialFile | LaminaLayerFile, exportName: string): Promise<void>;
