
/**
 * Simple Validator Utility (Lightweight replacement for Zod/Yup)
 * Ensures AI responses match expected structure to prevent runtime crashes.
 */

export class Validator {
    static isObject(val: any): boolean {
        return typeof val === 'object' && val !== null && !Array.isArray(val);
    }

    static isArray(val: any): boolean {
        return Array.isArray(val);
    }

    static isString(val: any): boolean {
        return typeof val === 'string';
    }

    static isNumber(val: any): boolean {
        return typeof val === 'number' && !isNaN(val);
    }

    static validateSchema(data: any, schema: any): boolean {
        if (!data) return false;

        // Array check
        if (schema.type === 'array') {
            if (!this.isArray(data)) return false;
            if (schema.items) {
                return data.every((item: any) => this.validateSchema(item, schema.items));
            }
            return true;
        }

        // Object check
        if (schema.type === 'object') {
            if (!this.isObject(data)) return false;
            
            // Required properties
            if (schema.required) {
                for (const key of schema.required) {
                    if (!(key in data)) {
                        console.warn(`Validation Error: Missing key '${key}' in object`, data);
                        return false;
                    }
                }
            }

            // Property types
            if (schema.properties) {
                for (const key in schema.properties) {
                    if (data[key] !== undefined) {
                        const isValid = this.validateSchema(data[key], schema.properties[key]);
                        if (!isValid) {
                            console.warn(`Validation Error: Key '${key}' failed validation`, data[key]);
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        // Primitive types
        if (schema.type === 'string') return this.isString(data);
        if (schema.type === 'number' || schema.type === 'integer') return this.isNumber(data);
        if (schema.type === 'boolean') return typeof data === 'boolean';

        return true;
    }

    static safeParse<T>(data: any, schema: any, fallback: T): T {
        try {
            if (this.validateSchema(data, schema)) {
                return data as T;
            }
            console.error("Data validation failed. Returning fallback.");
            return fallback;
        } catch (e) {
            console.error("Validation exception:", e);
            return fallback;
        }
    }
}
