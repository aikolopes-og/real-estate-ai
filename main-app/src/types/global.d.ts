declare module '*.css';
declare module '*.scss';
declare module '*.svg' {
  const content: string;
  export default content;
}

interface ImportMeta {
  readonly env: {
    [key: string]: string | undefined;
  };
}
