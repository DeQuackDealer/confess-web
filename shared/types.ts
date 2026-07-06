/** Shared type contracts between client and server. */

export interface Crush {
  id: number;
  name: string;
  integer: string;
  message: string;
  created: string;
}

export type CrushInput = Omit<Crush, 'id' | 'created'> & { created?: string };

export interface RenderResponse {
  grid: boolean[][];
  decimal: string;
  hex: string;
  binary: string;
  bitLength: number;
  digitCount: number;
  hidden: {
    found: boolean;
    message?: string;
  };
}

export interface CheckResponse {
  found: boolean;
  message?: string;
}

export interface ApiError {
  error: string;
}

export interface AppConfig {
  siteName: string;
  theme: 'dark' | 'light';
}
