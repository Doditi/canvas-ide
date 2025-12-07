import type { FC } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import CanvasPane from './CanvasPane';
import EditorPane from './EditorPane';
import { INITIAL_CODE, STORAGE_KEY } from '../utils/initialCode';
import { useCanvasStore, type CanvasConfig } from '../store/canvasStore';
import { loadFonts } from '../utils/fontLoader';

const CanvasStudio: FC = () => {
  const { code, status, dims, cursorPos, safeCode, config, updateCodeAndConfig, setStatus, setDims, setCursorPos, setConfig } =
    useCanvasStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Inicializar el código desde localStorage o fallback a INITIAL_CODE
  useEffect(() => {
    if (code) return;
    if (typeof window === 'undefined') {
      updateCodeAndConfig(INITIAL_CODE);
      return;
    }

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      updateCodeAndConfig(saved ?? INITIAL_CODE);
    } catch {
      updateCodeAndConfig(INITIAL_CODE);
    }
  }, [code, updateCodeAndConfig]);

  const updateCanvasState = useCallback(
    (config: CanvasConfig) => {
      const canvas = canvasRef.current;
      const viewport = viewportRef.current;
      if (!canvas || !viewport) return;

      const width = config.canvasWidth ?? 800;
      const height = config.canvasHeight ?? 800;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        setDims(`${canvas.width} x ${canvas.height}`);
      }

      // Guardamos la última config conocida en el store global
      setConfig(config);

      // Calcular auto-scaling para que el canvas siempre se vea completo
      const viewportRect = viewport.getBoundingClientRect();
      const viewportWidth = viewportRect.width;
      const viewportHeight = viewportRect.height;
      const padding = 20; // Padding mínimo alrededor del canvas
      
      const availableWidth = viewportWidth - padding * 2;
      const availableHeight = viewportHeight - padding * 2;
      
      const scaleX = availableWidth / width;
      const scaleY = availableHeight / height;
      const scale = Math.min(scaleX, scaleY, 1); // No escalar más grande que el tamaño original
      
      // Aplicar escala al canvas
      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;
      canvas.style.transform = 'none'; // Resetear transform si había alguno

      // Ajustar posicionamiento dentro del viewport
      // Remover todas las clases de posicionamiento posibles
      viewport.classList.remove(
        'items-start', 'items-center', 'items-end',
        'justify-start', 'justify-center', 'justify-end',
        'p-10'
      );

      const position = config.position ?? 'center';
      
      // Aplicar clases según la posición
      switch (position) {
        case 'top-left':
          viewport.classList.add('items-start', 'justify-start');
          break;
        case 'top':
          viewport.classList.add('items-start', 'justify-center');
          break;
        case 'top-right':
          viewport.classList.add('items-start', 'justify-end');
          break;
        case 'right':
          viewport.classList.add('items-center', 'justify-end');
          break;
        case 'bottom-right':
          viewport.classList.add('items-end', 'justify-end');
          break;
        case 'bottom':
          viewport.classList.add('items-end', 'justify-center');
          break;
        case 'bottom-left':
          viewport.classList.add('items-end', 'justify-start');
          break;
        case 'left':
          viewport.classList.add('items-center', 'justify-start');
          break;
        case 'center':
        default:
          viewport.classList.add('items-center', 'justify-center');
          break;
      }
      
      // Agregar padding para todas las posiciones
      viewport.style.padding = `${padding}px`;
    },
    [setDims, setConfig],
  );

  const runCode = useCallback(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Obtener valores actuales del store (pueden haber cambiado desde que se creó el callback)
    const currentState = useCanvasStore.getState();
    const currentCode = currentState.code;
    const currentConfig = currentState.config;
    const currentSafeCode = currentState.safeCode;

    try {
      // Guardar en localStorage
      try {
        window.localStorage.setItem(STORAGE_KEY, currentCode);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('No se pudo guardar en localStorage', e);
      }

      // Actualizar el estado del canvas con la config actual
      updateCanvasState(currentConfig);

      // Reset canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      if (currentConfig.backgroundColor) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.restore();

      // Ejecutar script de usuario
      const runUserScript = new Function('canvas', 'ctx', currentSafeCode);
      runUserScript(canvas, ctx);

      setStatus('Saved');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setStatus('Error');
    }
  }, [updateCanvasState, setStatus]);

  // Debounce de ejecución cuando cambia el código
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setStatus('Saving');

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      runCode();
    }, 800);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [code, runCode]);

  // Listener de posición del cursor sobre el canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.round((e.clientX - rect.left) * scaleX);
      const y = Math.round((e.clientY - rect.top) * scaleY);
      setCursorPos(`x: ${x}, y: ${y}`);
    };

    canvas.addEventListener('mousemove', handleMove);
    return () => {
      canvas.removeEventListener('mousemove', handleMove);
    };
  }, [setCursorPos]);

  // Recalcular scaling cuando cambia el tamaño del viewport
  useEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const currentState = useCanvasStore.getState();
      updateCanvasState(currentState.config);
    });

    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateCanvasState]);

  // Cargar fuentes cuando cambie la configuración
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (config.fonts && config.fonts.length > 0) {
      loadFonts(config.fonts).catch((error) => {
        // Silenciosamente manejar errores - las fuentes usarán fallback
        console.warn('Error al cargar fuentes:', error);
      });
    }
  }, [config.fonts]);

  const handleReset = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('¿Estás seguro de resetear el código a la configuración inicial?')
    ) {
      updateCodeAndConfig(INITIAL_CODE);
      setStatus('Ready');
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `canvas-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleFormat = () => {
    if (editorRef.current) {
      const action = editorRef.current.getAction('editor.action.formatDocument');
      if (action) {
        action.run();
      }
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-gray-200">
      <EditorPane
        code={code}
        status={status}
        onChangeCode={updateCodeAndConfig}
        onReset={handleReset}
        onFormat={handleFormat}
        editorRef={editorRef}
      />

      <CanvasPane
        dims={dims}
        cursorPos={cursorPos}
        onDownload={handleDownload}
        canvasRef={canvasRef}
        viewportRef={viewportRef}
      />
    </div>
  );
};

export default CanvasStudio;