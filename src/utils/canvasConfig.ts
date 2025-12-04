export type CanvasConfig = {
  canvasWidth?: number;
  canvasHeight?: number;
  position?: 'center' | 'top-left' | string;
  backgroundColor?: string;
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
export function extractConfigFromCode(code: string): {
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
