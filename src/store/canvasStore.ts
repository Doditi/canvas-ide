import { create } from 'zustand';
import type { CanvasConfig } from '../utils/canvasConfig';

export type Status = 'Ready' | 'Saved' | 'Error' | 'Saving';

type CanvasState = {
  code: string;
  status: Status;
  dims: string;
  cursorPos: string;
  config: CanvasConfig;
  setCode: (code: string) => void;
  setStatus: (status: Status) => void;
  setDims: (dims: string) => void;
  setCursorPos: (cursorPos: string) => void;
  setConfig: (config: CanvasConfig) => void;
};

export const useCanvasStore = create<CanvasState>((set) => ({
  code: '',
  status: 'Ready',
  dims: 'initializing...',
  cursorPos: 'x: 0, y: 0',
  config: {},
  setCode: (code) => set({ code }),
  setStatus: (status) => set({ status }),
  setDims: (dims) => set({ dims }),
  setCursorPos: (cursorPos) => set({ cursorPos }),
  setConfig: (config) => set({ config }),
}));


