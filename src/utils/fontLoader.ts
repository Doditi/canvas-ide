/**
 * Utilidades para cargar fuentes dinámicamente desde Font Source CDN
 * 
 * Formato de URL: https://cdn.jsdelivr.net/fontsource/fonts/{fontName}@latest/{subset}-{weight}-normal.woff2
 */

export type FontConfig = {
  fontName: string;
  weights?: number[];
  subset?: string;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  format?: 'woff2' | 'woff';
};

const DEFAULT_SUBSET = 'latin';
const DEFAULT_WEIGHTS = [400];
const DEFAULT_DISPLAY = 'swap';
const DEFAULT_FORMAT = 'woff2';

/**
 * Normaliza el nombre de la fuente para usarlo en URLs y CSS
 * Convierte a minúsculas y reemplaza espacios por guiones
 */
function normalizeFontName(fontName: string): string {
  return fontName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Genera la URL de la fuente desde Font Source CDN
 */
function generateFontUrl(fontName: string, subset: string, weight: number, format: string): string {
  const normalizedName = normalizeFontName(fontName);
  return `https://cdn.jsdelivr.net/fontsource/fonts/${normalizedName}@latest/${subset}-${weight}-normal.${format}`;
}

/**
 * Carga una fuente individual y crea el @font-face correspondiente
 * Retorna true si se cargó exitosamente, false en caso contrario
 */
async function loadFontFace(
  fontName: string,
  weight: number,
  subset: string,
  format: string,
  display: string
): Promise<boolean> {
  const fontFamily = fontName;
  const fontUrl = generateFontUrl(fontName, subset, weight, format);
  const fontFaceName = `${fontFamily}-${weight}-${subset}`;

  // Verificar si ya existe esta fuente cargada
  if (document.fonts.check(`1em "${fontFamily}"`)) {
    // Verificar si ya tenemos este @font-face específico
    const existingStyle = document.getElementById(`font-face-${fontFaceName}`);
    if (existingStyle) {
      return true;
    }
  }

  try {
    // Intentar cargar la fuente para verificar que existe
    const font = new FontFace(fontFamily, `url(${fontUrl})`, {
      weight: weight.toString(),
      display: display as 'auto' | 'block' | 'swap' | 'fallback' | 'optional',
    });

    await font.load();

    // Agregar la fuente al documento
    document.fonts.add(font);

    // Crear un elemento <style> para el @font-face (opcional, pero útil para debugging)
    const style = document.createElement('style');
    style.id = `font-face-${fontFaceName}`;
    style.textContent = `
      @font-face {
        font-family: "${fontFamily}";
        font-weight: ${weight};
        font-style: normal;
        font-display: ${display};
        src: url("${fontUrl}") format("${format}");
      }
    `;
    document.head.appendChild(style);

    return true;
  } catch (error) {
    // Silenciosamente fallar - la fuente usará el fallback
    console.warn(`No se pudo cargar la fuente ${fontName} (peso ${weight}):`, error);
    return false;
  }
}

/**
 * Carga todas las fuentes especificadas en la configuración
 * Maneja errores silenciosamente - si una fuente falla, simplemente se omite
 */
export async function loadFonts(fonts: FontConfig[]): Promise<void> {
  if (!fonts || fonts.length === 0) return;

  const loadPromises: Promise<boolean>[] = [];

  for (const fontConfig of fonts) {
    const {
      fontName,
      weights = DEFAULT_WEIGHTS,
      subset = DEFAULT_SUBSET,
      display = DEFAULT_DISPLAY,
      format = DEFAULT_FORMAT,
    } = fontConfig;

    // Cargar cada peso de la fuente
    for (const weight of weights) {
      loadPromises.push(loadFontFace(fontName, weight, subset, format, display));
    }
  }

  // Esperar a que todas las fuentes se carguen (o fallen)
  await Promise.allSettled(loadPromises);
}

/**
 * Limpia las fuentes cargadas previamente (útil para resetear)
 * Nota: Esto no elimina las fuentes del documento, solo los estilos creados
 */
export function clearLoadedFonts(): void {
  // Opcional: podrías implementar limpieza aquí si es necesario
  // Por ahora, dejamos las fuentes cargadas ya que no causan problemas
}


