declare module '@google/genai';
declare module 'zustand' {
    export function create<T>(...args: any[]): any;
}

declare module '@vercel/node' {
    export type VercelRequest = any;
    export type VercelResponse = any;
}

declare var process: {
    env: {
        NODE_ENV: string;
        [key: string]: string | undefined;
    };
};
