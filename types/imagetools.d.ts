/// <reference types="vite-imagetools/client" />

// Type definitions for vite-imagetools optimized images
declare module '*&imagetools' {
  const outputs: {
    src: string;
    w: number;
    h: number;
    format: string;
  }[];
  export default outputs;
}

// Standard image imports (when not using imagetools query params)
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.jpg?*' {
  const outputs: string | {
    src: string;
    w: number;
    h: number;
    format: string;
  }[];
  export default outputs;
}

declare module '*.jpeg?*' {
  const outputs: string | {
    src: string;
    w: number;
    h: number;
    format: string;
  }[];
  export default outputs;
}

declare module '*.png?*' {
  const outputs: string | {
    src: string;
    w: number;
    h: number;
    format: string;
  }[];
  export default outputs;
}

declare module '*.webp?*' {
  const outputs: string | {
    src: string;
    w: number;
    h: number;
    format: string;
  }[];
  export default outputs;
}
