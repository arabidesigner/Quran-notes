/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MUSHAF_PAGE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
