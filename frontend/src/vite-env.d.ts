/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Додайте для HMR
interface ImportMeta {
  readonly hot?: {
    accept: (fn?: () => void) => void;
    dispose: (fn: () => void) => void;
  };
}