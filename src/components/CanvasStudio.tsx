import Editor from '@monaco-editor/react';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'canvas_editor_v1_content';

const initialCode = `
export const config = {
  canvasWidth: 600,
  canvasHeight: 600,
  position: 'center',
  backgroundColor: '#ffffff'
};

// Fondo oscuro base
ctx.fillStyle = '#111827';
ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

// Configuración de gradiente
const gradient = ctx.createLinearGradient(0, 0, config.canvasWidth, config.canvasHeight);
gradient.addColorStop(0, '#f43f5e'); // Rose
gradient.addColorStop(1, '#6366f1'); // Indigo

// Círculo central
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(300, 300, 150, 0, Math.PI * 2);
ctx.fill();

// Efecto de brillo
ctx.shadowColor = '#f43f5e';
ctx.shadowBlur = 50;

// Texto
ctx.fillStyle = 'white';
ctx.shadowBlur = 0; // Reset shadow para texto nítido
ctx.font = 'bold 40px Inter, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Canvas Editor', 300, 280);

ctx.font = 'normal 20px Inter, sans-serif';
ctx.fillStyle = '#cbd5e1';
ctx.fillText('Changes are saved automatically', 300, 320);
`.trim();

type CanvasConfig = {
  canvasWidth?: number;
  canvasHeight?: number;
  position?: 'center' | 'top-left' | string;
  backgroundColor?: string;
};

type Status = 'Ready' | 'Saved' | 'Error' | 'Saving';

type EditorPaneProps = {
  code: string;
  status: Status;
  onChangeCode: (code: string) => void;
  onReset: () => void;
  onFormat: () => void;
  editorRef: React.MutableRefObject<any | null>;
};

const EditorPane: FC<EditorPaneProps> = ({
  code,
  status,
  onChangeCode,
  onReset,
  onFormat,
  editorRef,
}) => {
  return (
    <div className="w-1/2 h-full flex flex-col border-r border-gray-800 bg-[#1e1e1e]">
      <div className="h-12 flex items-center justify-between px-4 bg-[#1e1e1e] border-b border-gray-800 select-none">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
          <i className="ph ph-code text-[#818cf8] text-lg" />
          <span>script.js</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onReset}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition"
            title="Restaurar código original"
            type="button"
          >
            <i className="ph ph-trash" />
          </button>
          <button
            onClick={onFormat}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"
            title="Formatear código"
            type="button"
          >
            <i className="ph ph-magic-wand" />
          </button>
          <div className="w-16 text-right">
            {status === 'Saving' ? (
              <div className="ml-auto inline-block border-2 border-gray-700 border-t-[#818cf8] rounded-full w-3.5 h-3.5 animate-spin" />
            ) : (
              <span
                className={`text-xs font-mono ${
                  status === 'Error' ? 'text-red-500 font-bold' : 'text-gray-400'
                }`}
              >
                {status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
          onChange={(val) => onChangeCode(val ?? '')}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    </div>
  );
};

type CanvasPaneProps = {
  dims: string;
  cursorPos: string;
  onDownload: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
};

const CanvasPane: FC<CanvasPaneProps> = ({
  dims,
  cursorPos,
  onDownload,
  canvasRef,
  viewportRef,
}) => {
  return (
    <div className="w-1/2 h-full relative bg-gray-950 flex flex-col overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-xs font-medium transition shadow-lg backdrop-blur-sm bg-opacity-80 text-white"
          type="button"
        >
          <i className="ph ph-download-simple" />
          Guardar PNG
        </button>
      </div>
      <div
        ref={viewportRef}
        className="grow flex overflow-auto relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
      >
        <canvas ref={canvasRef} className="shadow-2xl transition-all duration-300" />
      </div>
      <div className="h-8 bg-gray-900 border-t border-gray-800 flex items-center px-4 justify-between text-xs text-gray-500 font-mono">
        <span>{dims}</span>
        <span>{cursorPos}</span>
      </div>
    </div>
  );
};

const CanvasStudio: FC = () => {
  const [code, setCode] = useState<string>(() => {
    if (typeof window === 'undefined') return initialCode;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ?? initialCode;
    } catch {
      return initialCode;
    }
  });

  const [status, setStatus] = useState<Status>('Ready');
  const [dims, setDims] = useState<string>('initializing...');
  const [cursorPos, setCursorPos] = useState<string>('x: 0, y: 0');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any | null>(null);
  const debounceRef = useRef<number | null>(null);

  const updateCanvasState = useCallback(
    (config: CanvasConfig) => {
      const canvas = canvasRef.current;
      const viewport = viewportRef.current;
      if (!canvas || !viewport) return;

      const width = config.canvasWidth ?? 800;
      const height = config.canvasHeight ?? 600;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        setDims(`${canvas.width} x ${canvas.height}`);
      }

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

      // Extracción de config
      let config: CanvasConfig = {
        canvasWidth: 800,
        canvasHeight: 600,
        position: 'center',
        backgroundColor: '#fff',
      };

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
        // ignorar errores de extracción de config
      }

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
    if (typeof window !== 'undefined' && window.confirm('¿Estás seguro de resetear el código a la configuración inicial?')) {
      setCode(initialCode);
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


