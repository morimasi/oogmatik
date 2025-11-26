
import { createClient } from '@supabase/supabase-js';

// Helper to safely access env variables across different environments (Vite/Next/Node)
const getEnv = (key: string): string | undefined => {
    let val: string | undefined;
    // 1. Try Vite import.meta.env
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            val = import.meta.env[key];
        }
    } catch (e) {}

    // 2. Try process.env (Node/Webpack fallback)
    if (!val) {
        try {
            // @ts-ignore
            if (typeof process !== 'undefined' && process.env) {
                // @ts-ignore
                val = process.env[key];
            }
        } catch (e) {}
    }
    return val;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Initialize connection if keys exist
let supabaseInstance = null;

try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        console.warn("Supabase credentials missing or invalid. App will run in Offline/Mock mode.");
    }
} catch (error) {
    console.error("Supabase initialization failed:", error);
}

export const supabase = supabaseInstance;

// Connection check helper
export const checkDbConnection = async () => {
    if (!supabase) {
        return false;
    }
    try {
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            console.warn("DB Connection warning:", error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error("DB Connection error:", e);
        return false;
    }
};
