
/**
 * Simple Validator Utility (Lightweight replacement for Zod/Yup)
 * Ensures AI responses match expected structure to prevent runtime crashes.
 */

export class Validator {
    static isObject(val: unknown): val is Record<string, unknown> {
        return typeof val === 'object' && val !== null && !Array.isArray(val);
    }

    static isArray(val: unknown): val is unknown[] {
        return Array.isArray(val);
    }

    static isString(val: unknown): val is string {
        return typeof val === 'string';
    }

    static isNumber(val: unknown): val is number {
        return typeof val === 'number' && !isNaN(val);
    }

    static validateSchema(data: unknown, schema: Record<string, unknown>): boolean {
        if (!data) return false;

        // Array check
        if (schema.type === 'array') {
            if (!this.isArray(data)) return false;
            if (schema.items) {
                return data.every((item: unknown) => this.validateSchema(item, schema.items as Record<string, unknown>));
            }
            return true;
        }

        // Object check
        if (schema.type === 'object') {
            if (!this.isObject(data)) return false;

            // Required properties
            if (schema.required && this.isArray(schema.required)) {
                for (const key of schema.required) {
                    if (typeof key === 'string' && !(key in data)) {
                        console.warn(`Validation Error: Missing key '${key}' in object`, data);
                        return false;
                    }
                }
            }

            // Property types
            if (schema.properties && this.isObject(schema.properties)) {
                for (const key in schema.properties) {
                    if (data[key] !== undefined) {
                        const isValid = this.validateSchema(data[key], schema.properties[key] as Record<string, unknown>);
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

    static safeParse<T>(data: unknown, schema: Record<string, unknown>, fallback: T): T {
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
