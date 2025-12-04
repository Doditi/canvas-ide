import Editor from '@monaco-editor/react';
import type { FC, MutableRefObject } from 'react';
import type { Status } from '../store/canvasStore';

type EditorPaneProps = {
  code: string;
  status: Status;
  onChangeCode: (code: string) => void;
  onReset: () => void;
  onFormat: () => void;
  editorRef: MutableRefObject<any | null>;
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

export default EditorPane;


