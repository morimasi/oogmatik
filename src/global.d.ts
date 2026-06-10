declare module '@vercel/node' {
    export type VercelRequest = any;
    export type VercelResponse = any;
}

declare let process: {
    env: {
        NODE_ENV: string;
        [key: string]: string | undefined;
    };
};
