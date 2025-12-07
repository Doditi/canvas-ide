import { create } from 'zustand';
import type { FontConfig } from '../utils/fontLoader';

export type Status = 'Ready' | 'Saved' | 'Error' | 'Saving';

export type Position = 
  | 'center'
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

export type CanvasConfig = {
  canvasWidth?: number;
  canvasHeight?: number;
  position?: Position;
  backgroundColor?: string;
  fonts?: FontConfig[];
};

export const DEFAULT_CONFIG: CanvasConfig = {
  canvasWidth: 600,
  canvasHeight: 600,
  position: 'center',
  backgroundColor: '#fff',
};

/**
 * Extrae la configuración del código del usuario y devuelve:
 * - config final mergeada con DEFAULT_CONFIG
 * - safeCode sin `export const config` para poder ejecutar con new Function
 *
 * Importante: para evitar que errores en el código de dibujo (uso de `canvas`,
 * `ctx`, etc.) rompan la extracción, intentamos parsear sólo el objeto de
 * `export const config = { ... }` en vez de ejecutar todo el script.
 */
function extractConfigFromCode(code: string): {
  config: CanvasConfig;
  safeCode: string;
} {
  let config: CanvasConfig = { ...DEFAULT_CONFIG };

  // Reemplazamos "export const config" para que el código sea válido dentro de new Function
  const safeCode = code.replace(/export\s+const\s+config/g, 'const config');

  try {
    const exportIndex = code.search(/export\s+const\s+config\s*=\s*{/m);
    if (exportIndex !== -1) {
      const startBrace = code.indexOf('{', exportIndex);
      if (startBrace !== -1) {
        let braceCount = 1;
        let i = startBrace + 1;

        while (i < code.length && braceCount > 0) {
          const ch = code[i];
          if (ch === '{') braceCount += 1;
          else if (ch === '}') braceCount -= 1;
          i += 1;
        }

        if (braceCount === 0) {
          const objectLiteral = code.slice(startBrace, i);
          // Evaluamos sólo el objeto. Lo envolvemos en paréntesis para que sea
          // una expresión válida incluso con propiedades con coma final, etc.
          const parsed = new Function(`return (${objectLiteral});`)();
          if (parsed && typeof parsed === 'object') {
            config = { ...config, ...parsed };
          }
        }
      }
    }
  } catch {
    // Si falla la extracción, dejamos config por defecto
  }

  return { config, safeCode };
}

type CanvasState = {
  code: string;
  status: Status;
  dims: string;
  cursorPos: string;
  config: CanvasConfig;
  safeCode: string;
  setCode: (code: string) => void;
  setStatus: (status: Status) => void;
  setDims: (dims: string) => void;
  setCursorPos: (cursorPos: string) => void;
  setConfig: (config: CanvasConfig) => void;
  updateCodeAndConfig: (code: string) => void;
  extractConfigFromCode: (code: string) => { config: CanvasConfig; safeCode: string };
};

export const useCanvasStore = create<CanvasState>((set) => ({
  code: '',
  status: 'Ready',
  dims: 'initializing...',
  cursorPos: 'x: 0, y: 0',
  config: DEFAULT_CONFIG,
  safeCode: '',
  setCode: (code) => {
    const { config, safeCode } = extractConfigFromCode(code);
    set({ code, config, safeCode });
  },
  setStatus: (status) => set({ status }),
  setDims: (dims) => set({ dims }),
  setCursorPos: (cursorPos) => set({ cursorPos }),
  setConfig: (config) => set({ config }),
  updateCodeAndConfig: (code) => {
    const { config, safeCode } = extractConfigFromCode(code);
    set({ code, config, safeCode });
  },
  extractConfigFromCode,
}));


