export interface Sesion {
    payload: string;
    createdAt: Date;
    refreshAt: Date;
    expiresAt: Date;
  }