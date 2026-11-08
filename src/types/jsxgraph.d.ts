declare module 'jsxgraph' {
  export interface Board {
    create: (type: string, parents?: any[], attributes?: Record<string, any>) => any;
    update: () => void;
    setBoundingBox: (box: [number, number, number, number], keepaspectratio?: boolean) => void;
    removeObject: (object: any) => void;
  }

  export interface JXGOptions {
    boundingbox?: [number, number, number, number];
    axis?: boolean;
    grid?: boolean;
    showNavigation?: boolean;
    showCopyright?: boolean;
    keepaspectratio?: boolean;
    pan?: { enabled?: boolean; needShift?: boolean };
    zoom?: { factorX?: number; factorY?: number; wheel?: boolean };
  }

  const JXG: {
    JSXGraph: {
      initBoard: (id: string, options?: JXGOptions) => Board;
      freeBoard: (board: Board) => void;
    };
  };

  export default JXG;
}
