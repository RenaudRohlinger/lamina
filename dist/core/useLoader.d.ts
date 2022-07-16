import * as React from 'react';
import * as LAYERS from '../vanilla';
import { LayerMaterialProps, LayerProps } from '../types';
export declare function useLamina<T extends LayerProps>(url: string): React.ForwardRefExoticComponent<Omit<LayerMaterialProps, "ref"> & {
    children?: React.ReactNode;
} & React.RefAttributes<LAYERS.LayerMaterial>> | React.ForwardRefExoticComponent<React.PropsWithoutRef<T> & React.RefAttributes<LAYERS.Abstract>>;
