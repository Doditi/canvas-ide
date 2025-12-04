import type { FC, RefObject } from 'react';

type CanvasPaneProps = {
  dims: string;
  cursorPos: string;
  onDownload: () => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
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

export default CanvasPane;


