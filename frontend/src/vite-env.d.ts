/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare global {
  interface Window {
    __COMPONENT_ERROR__?: (componentName: string | Error, errorInfo?: any) => void;
  }
}

export {};
