<<<<<<< HEAD
=======
declare module '@google/genai';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
