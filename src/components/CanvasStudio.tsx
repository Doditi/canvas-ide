import type { FC } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import CanvasPane from './CanvasPane';
import EditorPane from './EditorPane';
import { INITIAL_CODE, STORAGE_KEY } from '../utils/initialCode';
import { extractConfigFromCode, type CanvasConfig } from '../utils/canvasConfig';
import { useCanvasStore } from '../store/canvasStore';

const CanvasStudio: FC = () => {
  const { code, status, dims, cursorPos, setCode, setStatus, setDims, setCursorPos, setConfig } =
    useCanvasStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Inicializar el código desde localStorage o fallback a INITIAL_CODE
  useEffect(() => {
    if (code) return;
    if (typeof window === 'undefined') {
      setCode(INITIAL_CODE);
      return;
    }

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      setCode(saved ?? INITIAL_CODE);
    } catch {
      setCode(INITIAL_CODE);
    }
  }, [code, setCode]);

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

      // Ajustar posicionamiento dentro del viewport
      viewport.classList.remove('items-center', 'justify-center', 'p-10');
      if (config.position === 'center') {
        viewport.classList.add('items-center', 'justify-center');
      } else {
        viewport.classList.add('p-10');
      }
    },
    [],
  );

  const runCode = useCallback(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Guardar en localStorage
      try {
        window.localStorage.setItem(STORAGE_KEY, code);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('No se pudo guardar en localStorage', e);
      }

      // Extraer config y código seguro
      const { config, safeCode } = extractConfigFromCode(code);
      updateCanvasState(config);

      // Reset canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      if (config.backgroundColor) {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.restore();

      // Ejecutar script de usuario
      const runUserScript = new Function('canvas', 'ctx', safeCode);
      runUserScript(canvas, ctx);

      setStatus('Saved');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setStatus('Error');
    }
  }, [code, updateCanvasState]);

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
  }, []);

  const handleReset = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('¿Estás seguro de resetear el código a la configuración inicial?')
    ) {
      setCode(INITIAL_CODE);
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
        onChangeCode={setCode}
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