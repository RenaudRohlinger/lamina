import * as THREE from 'three';
import { LayerMaterial, Abstract } from './LayerMaterial';
export declare class LaminaLoader extends THREE.Loader {
    texLoader: THREE.TextureLoader;
    constructor(manager?: THREE.LoadingManager);
    load<T extends LayerMaterial | Abstract = LayerMaterial>(url: string, onLoad?: (event: T) => void, onError?: (event: Error) => void): void;
    loadAsync<T extends LayerMaterial | Abstract = LayerMaterial>(url: string): Promise<T>;
}
