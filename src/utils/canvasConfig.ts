export type CanvasConfig = {
  canvasWidth?: number;
  canvasHeight?: number;
  position?: 'center' | 'top-left' | string;
  backgroundColor?: string;
};

export const DEFAULT_CONFIG: CanvasConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  position: 'center',
  backgroundColor: '#fff',
};

/**
 * Extrae la configuración del código del usuario y devuelve:
 * - config final mergeada con DEFAULT_CONFIG
 * - safeCode sin `export const config` para poder ejecutar con new Function
 */
export function extractConfigFromCode(code: string): {
  config: CanvasConfig;
  safeCode: string;
} {
  let config: CanvasConfig = { ...DEFAULT_CONFIG };

  // Reemplazamos "export const config" para que el código sea válido dentro de new Function
  const safeCode = code.replace(/export\s+const\s+config/g, 'const config');

  try {
    const configExtractor = new Function(
      `
${safeCode}
if (typeof config !== 'undefined') return config;
return null;
`.trim(),
    );
    const extracted = configExtractor();
    if (extracted && typeof extracted === 'object') {
      config = { ...config, ...extracted };
    }
  } catch {
    // Si falla la extracción, dejamos config por defecto
  }

  return { config, safeCode };
}


