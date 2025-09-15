/// <reference types="vite/client" />

// Ensure TS recognizes import.meta.glob in strict contexts
interface ImportMetaEnv {
  // add custom env vars here if needed
}

interface ImportMeta {
  glob: (pattern: string, options?: { eager?: boolean; import?: string }) => Record<string, unknown>;
}
