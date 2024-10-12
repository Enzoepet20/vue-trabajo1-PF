import type { Sesion } from './Sesion';

export interface SesionState {
  loading: boolean;
  data: Sesion | null;
}