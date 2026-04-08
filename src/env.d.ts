/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WECHAT_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare interface Window {
  wx?: any;
}


